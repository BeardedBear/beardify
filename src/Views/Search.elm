module Views.Search exposing (view)

import Data.Album
import Data.Artist
import Data.Image
import Data.Search
import Data.Track
import Html.Styled as Html exposing (..)
import Html.Styled.Attributes exposing (..)
import Html.Styled.Events exposing (onClick, onInput)
import Http
import Json.Decode as Decode exposing (..)
import Request
import Route
import Utils
import Views.Artist



-- type Msg
--     = FindArtist (Result Http.Error (List Data.Artist.Artist))
--     | FindAlbum (Result Http.Error (List Data.Album.Album))
--     | FindTrack (Result Http.Error (List Data.Track.Track))
--     | Query String String
-- update : Msg -> Data.Search.Model -> ( Data.Search.Model, Cmd Msg )
-- update msg model =
--     case msg of
--         FindArtist (Ok artist) ->
--             ( { model | findArtist = artist }
--             , Cmd.none
--             )
--         FindArtist (Err _) ->
--             ( model, Cmd.none )
--         FindAlbum (Ok album) ->
--             ( { model | findAlbum = album }
--             , Cmd.none
--             )
--         FindAlbum (Err _) ->
--             ( model, Cmd.none )
--         FindTrack (Ok track) ->
--             ( { model | findTrack = track }
--             , Cmd.none
--             )
--         FindTrack (Err _) ->
--             ( model, Cmd.none )
--         Query token e ->
--             ( { model | searchQuery = e }
--             , Cmd.batch
--                 [ Http.send FindArtist <| Request.get "search?q=" (e ++ "*") "&type=artist&limit=10" (Decode.at [ "artists", "items" ] (Decode.list Data.Artist.decodeArtist)) token
--                 , Http.send FindAlbum <| Request.get "search?q=" (e ++ "*") "&type=album&limit=9" (Decode.at [ "albums", "items" ] (Decode.list Data.Album.decodeAlbum)) token
--                 , Http.send FindTrack <| Request.get "search?q=" (e ++ "*") "&type=track&limit=12" (Decode.at [ "tracks", "items" ] (Decode.list Data.Track.decodeTrack)) token
--                 ]
--             )


view : Data.Search.Model -> Html msg
view searchMsg =
    let
        artistItem ar =
            div [ class "artist-item" ]
                [ div [ class "img" ] [ Data.Image.imageView Data.Image.Small ar.images ]
                , a [ Route.href (Route.Artist ar.id) ] [ text ar.name ]
                ]

        albumItem al =
            div [ class "album-item" ]
                [ a [ Route.href (Route.Album al.id), class "search-cover-image" ] [ Data.Image.imageView Data.Image.Small al.images ]
                , div []
                    [ strong [] [ text <| al.name ++ " " ]
                    , text <| "(" ++ Utils.releaseDateFormat al.release_date ++ ")"
                    , a [ Route.href (Route.Artist al.id) ] [ Views.Artist.artistList al.artists ]
                    ]
                ]

        trackItem t =
            div [ class "track-item" ]
                [ -- div [ onClick (Meta.ChangePlayingTrack [ t.uri ]), class "track-icon" ] [ i [ class "icon-play" ] [] ]
                  div [ class "track-icon" ] [ i [ class "icon-play" ] [] ]
                , div []
                    [ strong [] [ text t.name ]
                    , div [] [ Views.Artist.artistList t.artists ]
                    ]
                , div []
                    [ text (Utils.durationFormat t.duration_ms)
                    ]
                ]
    in
    div [ class "search" ]
        [ div []
            [ input
                [ classList [ ( "active", searchMsg.searchQuery /= "" ) ]
                , id "search"
                , placeholder "Recherche"
                , type_ "text"
                , Html.Styled.Attributes.value searchMsg.searchQuery

                -- , onInput (Query token)
                ]
                []
            , if searchMsg.searchQuery /= "" then
                div [ class "results" ]
                    [ div []
                        [ div [ class "title" ] [ text "Artists" ]
                        , div [] (searchMsg.findArtist |> List.map artistItem)
                        ]
                    , div []
                        [ div [ class "title" ] [ text "Albums" ]
                        , div []
                            (searchMsg.findAlbum
                                |> List.filter (\a -> a.album_type == "album")
                                |> List.map albumItem
                            )
                        ]
                    , div []
                        [ div [ class "title" ] [ text "Tracks" ]
                        , div []
                            (searchMsg.findTrack |> List.map trackItem)
                        ]
                    ]

              else
                text ""
            ]
        ]
