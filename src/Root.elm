module Root exposing (Model, Msg(..), update)

import Album exposing (..)
import Artist exposing (..)
import Browser exposing (Document)
import Browser.Navigation as Nav
import Drawer exposing (..)
import Http exposing (..)
import Player exposing (..)
import Playlist exposing (..)
import Search exposing (..)
import Time exposing (..)
import Track exposing (..)
import Url exposing (Url)
import Youtube exposing (..)


type alias Model =
    { config :
        { token : String
        }
    , drawer : Drawer.Model
    , searchModel : Search.Model
    , player : Player.Model
    }


type Msg
    = UrlChanged Url
    | UrlRequested Browser.UrlRequest
    | GetPlaylists (Result Http.Error Playlistslist)
    | GetA String
    | GetAlbum (Result Http.Error Album)
    | GetAlbumTracks (Result Http.Error AlbumTracks)
    | Get String
    | GetArtist (Result Http.Error Artist)
    | GetArtistAlbums (Result Http.Error ListAlbum)
    | GetArtistTopTracks (Result Http.Error ArtistTopTracks)
    | GetRelatedArtists (Result Http.Error RelatedArtists)
    | GetPlayer (Result Http.Error Player.Model)
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
update msg ({ searchModel, config, drawer } as model) =
    let
        catchDrawerAlbum =
            drawer.drawerAlbum

        catchDrawerArtist =
            drawer.drawerArtist
    in
    case msg of
        UrlChanged url ->
            ( model, Cmd.none )

        UrlRequested urlRequest ->
            ( model, Cmd.none )

        GetPlaylists (Ok e) ->
            ( model, Cmd.none )

        GetPlaylists (Err _) ->
            ( model, Cmd.none )

        -- ALBUM
        GetA e ->
            ( model
            , Cmd.batch
                [ Http.send GetAlbum <| getAlbum e model.config.token
                , Http.send GetAlbumTracks <| getAlbumTracks e model.config.token
                ]
            )

        GetAlbum (Ok e) ->
            let
                album =
                    { catchDrawerAlbum | album = e }
            in
            ( { model
                | drawer =
                    { drawer
                        | drawerType = DrawAlbum
                        , drawerAlbum = album
                    }
              }
            , Cmd.none
            )

        GetAlbum (Err _) ->
            ( model, Cmd.none )

        GetAlbumTracks (Ok e) ->
            let
                tracks =
                    { catchDrawerAlbum | tracks = e.items }
            in
            ( { model
                | drawer = { drawer | drawerAlbum = tracks }
              }
            , Cmd.none
            )

        GetAlbumTracks (Err _) ->
            ( model, Cmd.none )

        -- ARTIST
        Get e ->
            ( model
            , Cmd.batch
                [ Http.send GetArtist <| getArtist e decodeArtist model.config.token
                , Http.send GetArtistAlbums <| getArtistAlbums e decodeArtistAlbums model.config.token
                , Http.send GetArtistTopTracks <| getArtistTopTracks e model.config.token
                , Http.send GetRelatedArtists <| getRelatedArtists e model.config.token
                ]
            )

        GetArtist (Ok e) ->
            let
                artist =
                    { catchDrawerArtist | artist = e }
            in
            ( { model
                | drawer =
                    { drawer
                        | drawerType = DrawArtist
                        , drawerArtist = artist
                    }
                , searchModel = { searchModel | searchQuery = "" }
              }
            , Http.send GetYoutube <| getVideos e.name
            )

        GetArtist (Err _) ->
            ( model, Cmd.none )

        GetArtistAlbums (Ok e) ->
            let
                albums =
                    { catchDrawerArtist | albums = e.items }
            in
            ( { model
                | drawer = { drawer | drawerArtist = albums }
                , searchModel = { searchModel | searchQuery = "" }
              }
            , Cmd.none
            )

        GetArtistAlbums (Err _) ->
            ( model, Cmd.none )

        GetArtistTopTracks (Ok e) ->
            let
                topTracks =
                    { catchDrawerArtist | topTracks = e.tracks }
            in
            ( { model | drawer = { drawer | drawerArtist = topTracks } }, Cmd.none )

        GetArtistTopTracks (Err _) ->
            ( model, Cmd.none )

        GetRelatedArtists (Ok e) ->
            let
                artists =
                    { catchDrawerArtist | relatedArtists = e.artists }
            in
            ( { model | drawer = { drawer | drawerArtist = artists } }, Cmd.none )

        GetRelatedArtists (Err _) ->
            ( model, Cmd.none )

        GetYoutube (Ok e) ->
            let
                videos =
                    { catchDrawerArtist | videos = e.items }
            in
            ( { model | drawer = { drawer | drawerArtist = videos } }, Cmd.none )

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
            ( model, Http.send PutSeekPosition <| putSeekPosition e model.config.token )

        PutSeekPosition (Ok e) ->
            ( model, Cmd.none )

        PutSeekPosition (Err _) ->
            ( model, Cmd.none )

        ClickNext ->
            ( model, Http.send PostControls <| postControls "POST" "next" model.config.token )

        ClickPrevious ->
            ( model, Http.send PostControls <| postControls "POST" "previous" model.config.token )

        ClickPlay ->
            ( model, Http.send PostControls <| postControls "PUT" "play" model.config.token )

        ClickPause ->
            ( model, Http.send PostControls <| postControls "PUT" "pause" model.config.token )

        ClickShuffleOff ->
            ( model, Http.send PostControls <| postControls "PUT" "shuffle?state=false" model.config.token )

        ClickShuffleOn ->
            ( model, Http.send PostControls <| postControls "PUT" "shuffle?state=true" model.config.token )

        ClickRepeatOff ->
            ( model, Http.send PostControls <| postControls "PUT" "repeat?state=off" model.config.token )

        ClickRepeatOn ->
            ( model, Http.send PostControls <| postControls "PUT" "repeat?state=track" model.config.token )

        ChangePlaying e ->
            ( model, Http.send PlayAlbum <| playAlbum e model.config.token )

        ChangePlayingTrack e ->
            ( model, Http.send PlayTrack <| putPlayTrack e model.config.token )

        SendPlayer _ ->
            ( model, Http.send GetPlayer <| getPlayer decodePlayer model.config.token )

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
                [ Http.send FindArtist <| search (e ++ "*") "artist" 10 decodeListArtist model.config.token
                , Http.send FindAlbum <| search (e ++ "*") "album" 13 decodeListAlbum model.config.token
                , Http.send FindTrack <| search (e ++ "*") "track" 16 decodeListTrack model.config.token
                ]
            )

        GoHome ->
            ( { model | drawer = { drawer | drawerType = Home } }, Cmd.none )

        GoReleases ->
            ( { model | drawer = { drawer | drawerType = Releases } }, Cmd.none )

        GoListen ->
            ( { model | drawer = { drawer | drawerType = Listen } }, Cmd.none )
