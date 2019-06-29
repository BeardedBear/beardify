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

        Query token e ->
            ( { model | searchQuery = e }
            , Cmd.batch
                [ Http.send FindArtist <| Request.get "search?q=" (e ++ "*") "&type=artist&limit=10" (Decode.at [ "artists", "items" ] (Decode.list Data.Artist.decodeArtist)) token
                , Http.send FindAlbum <| Request.get "search?q=" (e ++ "*") "&type=album&limit=9" (Decode.at [ "albums", "items" ] (Decode.list Data.Album.decodeAlbum)) token
                , Http.send FindTrack <| Request.get "search?q=" (e ++ "*") "&type=track&limit=12" (Decode.at [ "tracks", "items" ] (Decode.list Data.Track.decodeTrack)) token
                ]
            )

        PlayTrack _ ->
            ( { model | searchQuery = "" }, Cmd.none )


view : Session -> Model -> Html Msg
view session model =
    let
        artistItem ar =
            div [ class "artist-item" ]
                [ div [ class "img" ] [ Data.Image.imageView Data.Image.Small ar.images ]
                , span [ onClick <| ClickResult (Route.Artist ar.id) session.navKey ] [ text ar.name ]
                ]

        albumItem al =
            div [ class "album-item" ]
                [ span [ class "search-cover-image", onClick <| ClickResult (Route.Album al.id) session.navKey ] [ Data.Image.imageView Data.Image.Small al.images ]
                , div []
                    [ strong [] [ text <| al.name ++ " " ]
                    , text <| "(" ++ Utils.releaseDateFormat al.release_date ++ ")"
                    , span [ onClick <| ClickResult (Route.Artist al.id) session.navKey ] [ Views.Artist.artistList al.artists ]
                    ]
                ]

        trackItem t =
            div [ class "track-item" ]
                [ div [ onClick <| PlayTrack t.uri, class "track-icon" ] [ i [ class "icon-play" ] [] ]
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
