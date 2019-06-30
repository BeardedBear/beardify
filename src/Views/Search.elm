module Views.Search exposing (Model, Msg(..), update, view)

import Browser.Navigation as Nav
import Data.Album
import Data.Artist
import Data.Image
import Data.Search
import Data.Session exposing (Session)
import Data.Track
import Html exposing (Html, div, i, input, span, strong, text)
import Html.Attributes exposing (class, classList, id, placeholder, type_)
import Html.Events exposing (onClick, onInput)
import Http
import Json.Decode as Decode exposing (map)
import Request
import Route exposing (Route)
import Utils
import Views.Artist


type alias Model =
    Data.Search.Model


type Msg
    = FindArtist (Result Http.Error (List Data.Artist.Artist))
    | FindAlbum (Result Http.Error (List Data.Album.Album))
    | FindTrack (Result Http.Error (List Data.Track.Track))
    | Query String String
    | ClickResult Route Nav.Key
    | PlayTrack String


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        FindArtist (Ok artist) ->
            ( { model | findArtist = artist }
            , Cmd.none
            )

        FindArtist (Err _) ->
            ( model, Cmd.none )

        FindAlbum (Ok album) ->
            ( { model | findAlbum = album }
            , Cmd.none
            )

        FindAlbum (Err _) ->
            ( model, Cmd.none )

        FindTrack (Ok track) ->
            ( { model | findTrack = track }
            , Cmd.none
            )

        FindTrack (Err _) ->
            ( model, Cmd.none )

        ClickResult route key ->
            ( { model | searchQuery = "" }
            , Route.pushUrl key route
            )

        Query token query ->
            ( { model | searchQuery = query }
            , Cmd.batch
                [ Http.send FindArtist <| Request.get "search?q=" (query ++ "*") "&type=artist&limit=10" (Decode.at [ "artists", "items" ] (Decode.list Data.Artist.decodeArtist)) token
                , Http.send FindAlbum <| Request.get "search?q=" (query ++ "*") "&type=album&limit=9" (Decode.at [ "albums", "items" ] (Decode.list Data.Album.decodeAlbum)) token
                , Http.send FindTrack <| Request.get "search?q=" (query ++ "*") "&type=track&limit=12" (Decode.at [ "tracks", "items" ] (Decode.list Data.Track.decodeTrack)) token
                ]
            )

        PlayTrack _ ->
            ( { model | searchQuery = "" }, Cmd.none )


view : Session -> Model -> Html Msg
view session model =
    let
        artistItem artist =
            div [ class "artist-item" ]
                [ div [ class "img" ] [ Data.Image.imageView Data.Image.Small artist.images ]
                , span [ onClick <| ClickResult (Route.Artist artist.id) session.navKey ] [ text artist.name ]
                ]

        albumItem album =
            div [ class "album-item" ]
                [ span [ class "search-cover-image", onClick <| ClickResult (Route.Album album.id) session.navKey ] [ Data.Image.imageView Data.Image.Small album.images ]
                , div []
                    [ strong [] [ text <| album.name ++ " " ]
                    , text <| "(" ++ Utils.releaseDateFormat album.release_date ++ ")"
                    , span [ onClick <| ClickResult (Route.Artist album.id) session.navKey ] [ Views.Artist.view album.artists ]
                    ]
                ]

        trackItem track =
            div [ class "track-item" ]
                [ div [ onClick <| PlayTrack track.uri, class "track-icon" ] [ i [ class "icon-play" ] [] ]
                , div []
                    [ strong [] [ text track.name ]
                    , div [] [ Views.Artist.view track.artists ]
                    ]
                , div []
                    [ text (Utils.durationFormat track.duration_ms)
                    ]
                ]
    in
    div [ class "search" ]
        [ div []
            [ input
                [ classList [ ( "active", model.searchQuery /= "" ) ]
                , id "search"
                , placeholder "Recherche"
                , type_ "text"
                , onInput (Query session.token)
                ]
                []
            , if model.searchQuery /= "" then
                div [ class "results" ]
                    [ div []
                        [ div [ class "title" ] [ text "Artists" ]
                        , div [] (model.findArtist |> List.map artistItem)
                        ]
                    , div []
                        [ div [ class "title" ] [ text "Albums" ]
                        , div []
                            (model.findAlbum
                                |> List.filter (\a -> a.album_type == "album")
                                |> List.map albumItem
                            )
                        ]
                    , div []
                        [ div [ class "title" ] [ text "Tracks" ]
                        , div []
                            (model.findTrack |> List.map trackItem)
                        ]
                    ]

              else
                text ""
            ]
        ]
