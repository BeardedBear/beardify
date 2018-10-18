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
import Youtube exposing (..)


type alias Flags =
    {}


type alias ArtistModel =
    { artist : Artist
    , albums : List Album
    , videos : List Video
    , topTracks : List Track
    , relatedArtists : List Artist
    }


type alias AlbumModel =
    { album : Album
    , tracks : List TrackSimplified
    }


type DrawerType
    = DrawArtist
    | DrawAlbum
    | Home
    | Releases
    | Listen


type alias Model =
    { token : Token
    , drawerType : DrawerType
    , drawerArtist : ArtistModel
    , drawerAlbum : AlbumModel
    , searchModel : Search
    , player : Player
    }


init : Flags -> Url -> Nav.Key -> ( Model, Cmd Msg )
init flags url key =
    ( { token = { token = "" }
      , drawerType = Home
      , drawerArtist =
            { artist =
                { id = ""
                , images = []
                , name = ""
                , popularity = 0
                , type_ = ""
                }
            , albums = []
            , videos = []
            , topTracks = []
            , relatedArtists = []
            }
      , drawerAlbum =
            { album =
                { album_type = ""
                , artists = []
                , id = ""
                , images = []
                , name = ""
                , release_date = ""
                , type_ = ""
                , uri = ""
                }
            , tracks = []
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
    | GetToken (Result Http.Error Token)
    | GetA String
    | GetAlbum (Result Http.Error Album)
    | GetAlbumTracks (Result Http.Error AlbumTracks)
    | Get String
    | GetArtist (Result Http.Error Artist)
    | GetArtistAlbums (Result Http.Error ListAlbum)
    | GetArtistTopTracks (Result Http.Error ArtistTopTracks)
    | GetRelatedArtists (Result Http.Error RelatedArtists)
    | GetPlayer (Result Http.Error Player)
    | GetYoutube (Result Http.Error Youtube)
    | PostControls (Result Http.Error ())
    | ChangeSeek String
    | PutSeekPosition (Result Http.Error ())
    | ClickNext
    | ClickPrevious
    | ClickPlay
    | ClickPause
    | ClickShuffleOff
    | ClickShuffleOn
    | ClickRepeatOff
    | ClickRepeatOn
    | FindArtist (Result Http.Error ListArtist)
    | FindAlbum (Result Http.Error ListAlbum)
    | FindTrack (Result Http.Error ListTrack)
    | PlayAlbum (Result Http.Error ())
    | PlayTrack (Result Http.Error ())
    | Query String
    | ChangePlaying String
    | ChangePlayingTrack (List String)
    | SendPlayer Posix
    | GoHome
    | GoReleases
    | GoListen


update : Msg -> Model -> ( Model, Cmd Msg )
update msg ({ searchModel, token, drawerArtist, drawerAlbum } as model) =
    case msg of
        UrlChanged url ->
            ( model, Cmd.none )

        UrlRequested urlRequest ->
            ( model, Cmd.none )

        GetToken (Ok e) ->
            ( { model | token = e }, Cmd.none )

        GetToken (Err _) ->
            ( model, Cmd.none )

        -- ALBUM
        GetA e ->
            ( model
            , Cmd.batch
                [ Http.send GetAlbum <| getAlbum e token
                , Http.send GetAlbumTracks <| getAlbumTracks e token
                ]
            )

        GetAlbum (Ok e) ->
            ( { model
                | drawerType = DrawAlbum
                , drawerAlbum = { drawerAlbum | album = e }
              }
            , Cmd.none
            )

        GetAlbum (Err _) ->
            ( model, Cmd.none )

        GetAlbumTracks (Ok e) ->
            ( { model
                | drawerAlbum = { drawerAlbum | tracks = e.items }
              }
            , Cmd.none
            )

        GetAlbumTracks (Err e) ->
            let
                _ =
                    Debug.log "error" e
            in
            ( model, Cmd.none )

        -- ARTIST
        Get e ->
            ( model
            , Cmd.batch
                [ Http.send GetArtist <| getArtist e decodeArtist token
                , Http.send GetArtistAlbums <| getArtistAlbums e decodeArtistAlbums token
                , Http.send GetArtistTopTracks <| getArtistTopTracks e token
                , Http.send GetRelatedArtists <| getRelatedArtists e token
                ]
            )

        GetArtist (Ok e) ->
            ( { model
                | drawerType = DrawArtist
                , drawerArtist = { drawerArtist | artist = e }
                , searchModel = { searchModel | searchQuery = "" }
              }
            , Http.send GetYoutube <| getVideos e.name
            )

        GetArtist (Err _) ->
            ( model, Cmd.none )

        GetArtistAlbums (Ok e) ->
            ( { model
                | drawerArtist = { drawerArtist | albums = e.items }
                , searchModel = { searchModel | searchQuery = "" }
              }
            , Cmd.none
            )

        GetArtistAlbums (Err _) ->
            ( model, Cmd.none )

        GetArtistTopTracks (Ok e) ->
            ( { model | drawerArtist = { drawerArtist | topTracks = e.tracks } }, Cmd.none )

        GetArtistTopTracks (Err _) ->
            ( model, Cmd.none )

        GetRelatedArtists (Ok e) ->
            ( { model | drawerArtist = { drawerArtist | relatedArtists = e.artists } }, Cmd.none )

        GetRelatedArtists (Err _) ->
            ( model, Cmd.none )

        GetYoutube (Ok e) ->
            ( { model | drawerArtist = { drawerArtist | videos = e.items } }, Cmd.none )

        GetYoutube (Err _) ->
            ( model, Cmd.none )

        -- PLAYER
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

        ChangeSeek e ->
            ( model, Http.send PutSeekPosition <| putSeekPosition e token )

        PutSeekPosition (Ok e) ->
            ( model, Cmd.none )

        PutSeekPosition (Err _) ->
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

        ChangePlaying e ->
            ( model, Http.send PlayAlbum <| playAlbum e token )

        ChangePlayingTrack e ->
            ( model, Http.send PlayTrack <| putPlayTrack e token )

        SendPlayer _ ->
            ( model, Http.send GetPlayer <| getPlayer decodePlayer token )

        PlayAlbum (Ok _) ->
            ( model, Cmd.none )

        PlayAlbum (Err _) ->
            ( model, Cmd.none )

        PlayTrack (Ok _) ->
            ( model, Cmd.none )

        PlayTrack (Err _) ->
            ( model, Cmd.none )

        -- SEARCH
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

        Query e ->
            ( { model | searchModel = { searchModel | searchQuery = e } }
            , Cmd.batch
                [ Http.send FindArtist <| search (e ++ "*") "artist" 10 decodeListArtist token
                , Http.send FindAlbum <| search (e ++ "*") "album" 13 decodeListAlbum token
                , Http.send FindTrack <| search (e ++ "*") "track" 16 decodeListTrack token
                ]
            )

        GoHome ->
            ( { model | drawerType = Home }, Cmd.none )

        GoReleases ->
            ( { model | drawerType = Releases }, Cmd.none )

        GoListen ->
            ( { model | drawerType = Listen }, Cmd.none )


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
                    , div [] (searchModel.findArtist |> List.map artistItem)
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
                        (searchModel.findTrack |> List.map trackItem)
                    ]
                ]

          else
            text ""
        ]


homeView : Html Msg
homeView =
    text "bienvenue ! "


albumView : Player -> AlbumModel -> Html Msg
albumView player album =
    let
        trackItem t =
            div
                [ classList
                    [ ( "track album-page", True )
                    , ( "active", t.uri == player.item.uri )
                    ]
                , onClick (ChangePlayingTrack [ t.uri ])
                ]
                [ if t.uri == player.item.uri then
                    div [] [ i [ class "icon-play" ] [] ]

                  else
                    div [] [ i [ class "icon-music" ] [] ]
                , div [] [ text <| String.fromInt t.track_number ++ "." ]
                , div [] [ text t.name ]
                , div [] [ text (Utils.durationFormat t.duration_ms) ]
                ]

        trackSumDuration =
            album.tracks
                |> List.map (\d -> d.duration_ms)
                |> List.sum
    in
    div [ class "album-wrapper" ]
        [ div [ class "album-page-head" ]
            [ div [ class "heading-page" ] [ text album.album.name ]
            , div []
                [ span [] [ text "By " ]
                , span [] (album.album.artists |> List.map (\ar -> a [ onClick (Get ar.id) ] [ text ar.name ]))
                ]
            ]
        , div [ class "album-page" ]
            [ div []
                [ imageView Medium album.album.images
                , div [] [ text <| Utils.releaseDateFormat album.album.release_date ]
                , div [] [ text <| Utils.durationFormatMinutes trackSumDuration ]
                ]
            , div []
                [ div [] (album.tracks |> List.map trackItem)
                ]
            ]
        ]


artistView : Player -> ArtistModel -> Html Msg
artistView player data =
    let
        trackItem t =
            div [ class "track", onClick (ChangePlayingTrack [ t.uri ]) ]
                [ div [] [ imageView Small t.album.images ]
                , div [] [ text t.name ]
                , div [] [ text (Utils.durationFormat t.duration_ms) ]
                ]

        relatedArtistItem r =
            div [ class "related-artist", onClick (Get r.id) ]
                [ div [] [ imageView Small r.images ]
                , div [] [ text r.name ]
                ]
    in
    div [ class "artist-wrapper" ]
        [ div []
            [ div [ class "heading-page" ] [ text data.artist.name ]
            , div [] [ a [ href ("https://fr.wikipedia.org/wiki/" ++ data.artist.name), target "_BLANK" ] [ text "Wikipedia" ] ]
            , div [ class "artist-head" ]
                [ div [ class "top-tracks" ]
                    [ div [ class "sub-title" ] [ text "Top tracks" ]
                    , div [] (data.topTracks |> List.take 5 |> List.map trackItem)
                    ]
                , div []
                    [ div [ class "sub-title" ] [ text "Similar artists" ]
                    , div [ class "related-artists" ] (data.relatedArtists |> List.take 4 |> List.map relatedArtistItem)
                    ]
                ]
            , div [ class "sub-title" ] [ text "Albums" ]
            , data.albums
                |> List.map
                    (\a ->
                        div
                            [ classList
                                [ ( "album", True )
                                , ( "active", player.item.album.id == a.id )
                                ]
                            ]
                            [ div [ onClick (GetA a.id) ] [ imageView Medium a.images ]
                            , div [] [ text a.name ]
                            , div [ class "date" ] [ text <| "(" ++ Utils.releaseDateFormat a.release_date ++ ")" ]
                            , div [ class "playing-btn", onClick (ChangePlaying a.uri) ] [ i [ class "icon-play" ] [] ]
                            ]
                    )
                |> div [ class "album-list-wrapper" ]
            ]
        , div [ class "video-wrapper" ]
            [ div [ class "sub-title" ] [ text "Videos" ]
            , div []
                (data.videos
                    |> List.map
                        (\v ->
                            div [ class "video-frame" ]
                                [ iframe [ class "video", attribute "allowfullscreen" "", attribute "frameborder" "0", width 250, height 125, src <| "https://www.youtube.com/embed/" ++ v.id.videoId ] []
                                , div [ class "video-title" ] [ text v.snippet.title ]
                                , div [ class "video-channel" ] [ a [ target "_BLANK", href ("https://www.youtube.com/channel/" ++ v.snippet.channelId) ] [ text v.snippet.channelTitle ] ]
                                ]
                        )
                )
            ]
        ]


sidebarView : Model -> Html Msg
sidebarView model =
    div [ class "sidebar" ]
        [ div [ class "logo" ] [ text "Beardify" ]
        , div [ class "top-menu" ]
            [ div [ onClick GoHome, classList [ ( "active", model.drawerType == Home ) ] ] [ i [ class "icon-home" ] [], text "Home" ]
            , div [ onClick GoReleases, classList [ ( "active", model.drawerType == Releases ) ] ] [ i [ class "icon-bell" ] [], text "Sorties" ]
            , div [ onClick GoListen, classList [ ( "active", model.drawerType == Listen ) ] ] [ i [ class "icon-bookmark" ] [], text "A écouter" ]
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
            [ div [ onClick (GetA player.item.album.id) ] [ imageView Small player.item.album.images ]
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
                        , onInput ChangeSeek
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
            [ sidebarView model
            , div [ class "content" ]
                [ div [ class "topbar" ]
                    [ searchView model.searchModel
                    ]
                , div [ class "drawer" ]
                    [ case model.drawerType of
                        DrawArtist ->
                            artistView model.player model.drawerArtist

                        DrawAlbum ->
                            albumView model.player model.drawerAlbum

                        Home ->
                            homeView

                        _ ->
                            text ""
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
