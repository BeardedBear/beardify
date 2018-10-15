module Main exposing (main)

import Album exposing (..)
import Artist exposing (..)
import Browser exposing (Document)
import Browser.Navigation as Nav
import Device exposing (..)
import Html exposing (..)
import Html.Attributes exposing (..)
import Html.Events exposing (..)
import Http exposing (..)
import Image exposing (..)
import Json.Decode as Decode exposing (..)
import Json.Encode as Encode
import Player exposing (..)
import Search exposing (..)
import Time exposing (..)
import Token exposing (..)
import Track exposing (..)
import Url exposing (Url)
import Utils


type alias Flags =
    {}


type alias ShowArtist =
    { artist : Artist
    , albums : List Album
    }


type DrawerType
    = DrawArtist String
    | DrawAlbum String
    | None


type alias Model =
    { token : Token
    , drawerContent : ShowArtist
    , searchModel : Search
    , player : Player
    }


init : Flags -> Url -> Nav.Key -> ( Model, Cmd Msg )
init flags url key =
    ( { token = { token = "" }
      , drawerContent =
            { artist =
                { id = ""
                , images = []
                , name = ""
                , popularity = 0
                , type_ = ""
                }
            , albums = []
            }
      , searchModel =
            { findArtist = []
            , findAlbum = []
            , findTrack = []
            , searchQuery = ""
            }
      , player =
            { device =
                { id = ""
                , name = ""
                , volume_percent = 0
                }
            , is_playing = False
            , progress_ms = 0
            , item =
                { name = ""
                , duration_ms = 0
                , artists = []
                , album =
                    { album_type = ""
                    , artists = []
                    , id = " "
                    , images = []
                    , name = ""
                    , release_date = ""
                    , type_ = ""
                    , uri = ""
                    }
                , uri = ""
                }
            , repeat_state = ""
            , shuffle_state = False
            }
      }
    , Cmd.batch
        [ Http.send GetToken <| Http.get "token.json" decodeToken
        ]
    )


type Msg
    = UrlChanged Url
    | UrlRequested Browser.UrlRequest
    | ClickNext
    | ClickPrevious
    | ClickPlay
    | ClickPause
    | ClickShuffleOff
    | ClickShuffleOn
    | ClickRepeatOff
    | ClickRepeatOn
    | GetToken (Result Http.Error Token)
    | Get String
    | GetArtist (Result Http.Error Artist)
    | GetArtistAlbums (Result Http.Error ListAlbum)
    | GetPlayer (Result Http.Error Player)
    | PostControls (Result Http.Error ())
    | FindArtist (Result Http.Error ListArtist)
    | FindAlbum (Result Http.Error ListAlbum)
    | FindTrack (Result Http.Error ListTrack)
    | PlayAlbum (Result Http.Error ())
    | PlayTrack (Result Http.Error ())
    | Query String
    | ChangePlaying String
    | ChangePlayingTrack (List String)
    | SendPlayer Posix


update : Msg -> Model -> ( Model, Cmd Msg )
update msg ({ searchModel, token, drawerContent } as model) =
    case msg of
        UrlChanged url ->
            ( model, Cmd.none )

        UrlRequested urlRequest ->
            ( model, Cmd.none )

        ClickNext ->
            ( model, Http.send PostControls <| postControls "POST" "next" token )

        ClickPrevious ->
            ( model, Http.send PostControls <| postControls "POST" "previous" token )

        ClickPlay ->
            ( model, Http.send PostControls <| postControls "PUT" "play" token )

        ClickPause ->
            ( model, Http.send PostControls <| postControls "PUT" "pause" token )

        ClickShuffleOff ->
            ( model, Http.send PostControls <| postControls "PUT" "shuffle?state=false" token )

        ClickShuffleOn ->
            ( model, Http.send PostControls <| postControls "PUT" "shuffle?state=true" token )

        ClickRepeatOff ->
            ( model, Http.send PostControls <| postControls "PUT" "repeat?state=off" token )

        ClickRepeatOn ->
            ( model, Http.send PostControls <| postControls "PUT" "repeat?state=track" token )

        GetToken (Ok e) ->
            ( { model | token = e }, Cmd.none )

        GetToken (Err _) ->
            ( model, Cmd.none )

        Get e ->
            ( model
            , Cmd.batch
                [ Http.send GetArtist <| getArtist e decodeArtist token
                , Http.send GetArtistAlbums <| getArtistAlbums e decodeArtistAlbums token
                ]
            )

        GetArtist (Ok e) ->
            ( { model
                | drawerContent = { drawerContent | artist = e }
                , searchModel = { searchModel | searchQuery = "" }
              }
            , Cmd.none
            )

        GetArtist (Err _) ->
            ( model, Cmd.none )

        GetArtistAlbums (Ok e) ->
            ( { model
                | drawerContent = { drawerContent | albums = e.items }
                , searchModel = { searchModel | searchQuery = "" }
              }
            , Cmd.none
            )

        GetArtistAlbums (Err _) ->
            ( model, Cmd.none )

        GetPlayer (Ok e) ->
            ( { model | player = e }
            , Cmd.none
            )

        GetPlayer (Err _) ->
            ( model, Cmd.none )

        PostControls (Ok e) ->
            ( model, Cmd.none )

        PostControls (Err _) ->
            ( model, Cmd.none )

        FindArtist (Ok artist) ->
            ( { model | searchModel = { searchModel | findArtist = artist.items } }, Cmd.none )

        FindArtist (Err _) ->
            ( model, Cmd.none )

        FindAlbum (Ok album) ->
            ( { model | searchModel = { searchModel | findAlbum = album.items } }, Cmd.none )

        FindAlbum (Err _) ->
            ( model, Cmd.none )

        FindTrack (Ok track) ->
            ( { model | searchModel = { searchModel | findTrack = track.items } }, Cmd.none )

        FindTrack (Err _) ->
            ( model, Cmd.none )

        PlayAlbum (Ok _) ->
            ( model, Cmd.none )

        PlayAlbum (Err _) ->
            ( model, Cmd.none )

        PlayTrack (Ok _) ->
            ( model, Cmd.none )

        PlayTrack (Err _) ->
            ( model, Cmd.none )

        Query e ->
            ( { model | searchModel = { searchModel | searchQuery = e } }
            , Cmd.batch
                [ Http.send FindArtist <| search (e ++ "*") "artist" 10 decodeListArtist token
                , Http.send FindAlbum <| search (e ++ "*") "album" 13 decodeListAlbum token
                , Http.send FindTrack <| search (e ++ "*") "track" 16 decodeListTrack token
                ]
            )

        ChangePlaying e ->
            ( model, Http.send PlayAlbum <| playAlbum e token )

        ChangePlayingTrack e ->
            ( model, Http.send PlayTrack <| playTrack e token )

        SendPlayer _ ->
            ( model, Http.send GetPlayer <| getPlayer decodePlayer token )


subscriptions : Model -> Sub Msg
subscriptions model =
    Time.every 1000 SendPlayer



-- VIEWS


searchView : Search -> Html Msg
searchView searchModel =
    let
        artistItem a =
            div [ class "artist-item", onClick (Get a.id) ]
                [ div [ class "img" ] [ imageView Small a.images ]
                , span [] [ text a.name ]
                ]

        albumItem a =
            div [ style "clear" "both", style "margin-bottom" "10px" ]
                [ div [ class "search-cover-image", onClick (ChangePlaying a.uri) ] [ imageView Small a.images ]
                , strong [] [ text <| a.name ++ " " ]
                , text <| "(" ++ Utils.releaseDateFormat a.release_date ++ ")"
                , br [] []
                , Html.small [] (List.map (\artists -> text artists.name) a.artists)
                ]

        trackItem t =
            div []
                [ div [ onClick (ChangePlayingTrack [ t.uri ]), class "track-icon" ] [ text "🎵 " ]
                , strong [] [ text t.name ]
                , br [] []
                , Html.small [] (List.map (\artists -> text <| artists.name) t.artists)
                , span [] [ text " - " ]
                , Html.small [] [ text t.album.name ]
                , span [ style "float" "right" ]
                    [ text (Utils.durationFormat t.duration_ms)
                    ]
                ]
    in
    div [ class "search" ]
        [ div [] [ input [ placeholder "Recherche", type_ "text", onInput Query, Html.Attributes.value searchModel.searchQuery ] [] ]
        , if searchModel.searchQuery /= "" then
            div [ class "results" ]
                [ div []
                    [ div [ class "title" ] [ text "Artists" ]
                    , div []
                        (searchModel.findArtist
                            |> List.map artistItem
                        )
                    ]
                , div []
                    [ div [ class "title" ] [ text "Albums" ]
                    , div []
                        (searchModel.findAlbum
                            |> List.filter (\a -> a.album_type == "album")
                            |> List.map albumItem
                        )
                    ]
                , div []
                    [ div [ class "title" ] [ text "Tracks" ]
                    , div []
                        (searchModel.findTrack
                            |> List.map trackItem
                        )
                    ]
                ]

          else
            text ""
        ]


artistView : Player -> ShowArtist -> Html Msg
artistView player data =
    div []
        [ div [ class "artist-name" ] [ text data.artist.name ]
        , data.albums
            |> List.map
                (\a ->
                    div
                        [ classList
                            [ ( "album", True )
                            , ( "active", player.item.album.id == a.id )
                            ]
                        , onClick (ChangePlaying a.uri)
                        ]
                        [ div [] [ imageView Large a.images ]
                        , div [] [ text a.name ]
                        ]
                )
            |> div [ class "album-wrapper" ]
        ]


sidebarView : Html Msg
sidebarView =
    div [ class "sidebar" ]
        [ div [ class "logo" ] [ text "Beardify" ]
        , div [ class "top-menu" ]
            [ div [] [ i [ class "icon-home" ] [], text "Home" ]
            , div [] [ i [ class "icon-bell" ] [], text "Sorties" ]
            , div [ class "active" ] [ i [ class "icon-bookmark" ] [], text "A écouter" ]
            ]
        , div [ class "playlists" ]
            [ div [ class "title" ] [ text "Playlists" ]
            , div [ class "playlists-list" ]
                [ div [ class "playlist" ] [ i [ class "icon-music" ] [], text "Compil tubes de l'été 1999" ]
                , div [ class "playlist" ] [ i [ class "icon-music" ] [], text "Chansons du Club Dorothée" ]
                , div [ class "playlist" ] [ i [ class "icon-music" ] [], text "Hymnes nationaux" ]
                , div [ class "playlist" ] [ i [ class "icon-music" ] [], text "Faire du sport !" ]
                , div [ class "playlist" ] [ i [ class "icon-music" ] [], text "Chill" ]
                , div [ class "playlist" ] [ i [ class "icon-music" ] [], text "Go to the PARTY !" ]
                , div [ class "playlist" ] [ i [ class "icon-music" ] [], text "Make war, don't love !" ]
                , div [ class "playlist" ] [ i [ class "icon-music" ] [], text "Move your body" ]
                , div [ class "playlist" ] [ i [ class "icon-music" ] [], text "En voiture Simone" ]
                , div [ class "playlist" ] [ i [ class "icon-music" ] [], text "Dodo" ]
                , div [ class "playlist" ] [ i [ class "icon-music" ] [], text "Bricolage" ]
                ]
            ]
        ]


playerView : Player -> Html Msg
playerView player =
    div [ class "player" ]
        [ div [ class "controls" ]
            [ div []
                [ if player.is_playing then
                    button [ onClick ClickPause, class "play" ] [ i [ class "icon-pause" ] [] ]

                  else
                    button [ onClick ClickPlay, class "play" ] [ i [ class "icon-play" ] [] ]
                , button [ onClick ClickPrevious ] [ i [ class "icon-to-start" ] [] ]
                , button [ onClick ClickNext ] [ i [ class "icon-to-end" ] [] ]
                , button
                    [ classList [ ( "active", player.shuffle_state ) ]
                    , if player.shuffle_state then
                        onClick ClickShuffleOff

                      else
                        onClick ClickShuffleOn
                    ]
                    [ i [ class "icon-shuffle" ] [] ]
                , button [] [ i [ classList [ ( "icon-loop", True ), ( "active", player.repeat_state == "on" ) ] ] [] ]
                ]
            ]
        , div [ class "current" ]
            [ imageView Small player.item.album.images
            , div []
                [ div []
                    [ span [ class "track" ] [ text player.item.name ]
                    , span [] [ text " - " ]
                    , span [ class "artist" ]
                        (player.item.artists
                            |> List.map (\ar -> a [ onClick (Get ar.id) ] [ text <| ar.name ])
                        )
                    ]
                , div [ class "range" ]
                    [ span [ class "time" ] [ text <| Utils.durationFormat player.progress_ms ]
                    , input
                        [ type_ "range"
                        , Html.Attributes.value <| String.fromInt player.progress_ms
                        , Html.Attributes.min "0"
                        , Html.Attributes.max <| String.fromInt player.item.duration_ms
                        ]
                        []
                    , span [ class "time" ] [ text <| Utils.durationFormat player.item.duration_ms ]
                    ]
                ]
            ]
        , div [ class "options" ]
            [ div [] [ button [] [ i [ class "icon-sound" ] [] ] ]
            , div []
                [ input
                    [ type_ "range"
                    , Html.Attributes.value <| String.fromInt player.device.volume_percent
                    , Html.Attributes.min "0"
                    , Html.Attributes.max "100"
                    ]
                    []
                ]
            ]
        ]


view : Model -> Document Msg
view model =
    { title = ""
    , body =
        [ div [ class "app" ]
            [ sidebarView
            , div [ class "content" ]
                [ div [ class "topbar" ]
                    [ searchView model.searchModel
                    ]
                , div [ class "drawer" ]
                    [ artistView model.player model.drawerContent
                    ]
                , playerView model.player
                ]
            ]
        ]
    }


main : Program Flags Model Msg
main =
    Browser.application
        { init = init
        , view = view
        , update = update
        , subscriptions = subscriptions
        , onUrlChange = UrlChanged
        , onUrlRequest = UrlRequested
        }
