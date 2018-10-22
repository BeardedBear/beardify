module Root exposing (Model, Msg(..), update)

import Browser exposing (Document)
import Browser.Navigation as Nav
import Data.Album exposing (..)
import Data.Artist exposing (..)
import Data.Drawer as Drawer exposing (..)
import Data.Player as Player exposing (..)
import Data.Playlist exposing (..)
import Data.Search as Search exposing (..)
import Data.Track as Track exposing (..)
import Data.Youtube exposing (..)
import Http exposing (..)
import Json.Decode as Decode exposing (..)
import Request
import Time exposing (..)
import Url exposing (Url)


type alias Model =
    { config : { token : String }
    , playlists : List Playlists
    , drawer : Drawer.Model
    , searchModel : Search.Model
    , player : Player.Model
    }


type Msg
    = UrlChanged Url
    | UrlRequested Browser.UrlRequest
    | GetPlaylists (Result Http.Error Playlistslist)
    | GetPlaylist (Result Http.Error Playlist)
    | GetCollection (Result Http.Error Playlist)
    | GetC String
    | GetP String
    | GetA String
    | GetAlbum (Result Http.Error Album)
    | GetAlbumTracks (Result Http.Error AlbumTracks)
    | GetPlaylistTracks (Result Http.Error PlaylistPaging)
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
    | ClearQuery
    | ChangePlaying String
    | ChangePlayingTrack (List String)
    | SendPlayer Posix
    | GoHome
    | GoReleases
    | GoListen


update : Msg -> Model -> ( Model, Cmd Msg )
update msg ({ searchModel, config, drawer } as model) =
    let
        token =
            model.config.token

        catchDrawerAlbum =
            drawer.drawerAlbum

        catchDrawerArtist =
            drawer.drawerArtist

        catchDrawerPlaylist =
            drawer.drawerPlaylist

        catchDrawerCollection =
            drawer.drawerCollection
    in
    case msg of
        UrlChanged url ->
            ( model, Cmd.none )

        UrlRequested urlRequest ->
            ( model, Cmd.none )

        GetPlaylists (Ok e) ->
            ( { model | playlists = e.items }, Cmd.none )

        GetPlaylists (Err _) ->
            ( model, Cmd.none )

        GetPlaylist (Ok e) ->
            let
                playlist =
                    { catchDrawerPlaylist | playlist = e }
            in
            ( { model
                | drawer =
                    { drawer
                        | drawerType = DrawPlaylist
                        , drawerPlaylist = playlist
                    }
              }
            , Cmd.none
            )

        GetPlaylist (Err _) ->
            ( model, Cmd.none )

        GetCollection (Ok e) ->
            let
                collection =
                    { catchDrawerCollection | playlist = e }
            in
            ( { model
                | drawer =
                    { drawer
                        | drawerType = DrawCollection
                        , drawerCollection = collection
                    }
              }
            , Cmd.none
            )

        GetCollection (Err _) ->
            ( model, Cmd.none )

        GetP id ->
            ( model
            , Cmd.batch
                [ Http.send GetPlaylist <| Request.get "playlists/" id "" decodePlaylist token
                , Http.send GetPlaylistTracks <| Request.get "playlists/" id "/tracks" decodePlaylistPaging token
                ]
            )

        GetC id ->
            ( model
            , Cmd.batch
                [ Http.send GetCollection <| Request.get "playlists/" id "" decodePlaylist token
                , Http.send GetPlaylistTracks <| Request.get "playlists/" id "/tracks" decodePlaylistPaging token
                ]
            )

        -- ALBUM
        GetA e ->
            ( { model | searchModel = { searchModel | searchQuery = "" } }
            , Cmd.batch
                [ Http.send GetAlbum <| Request.get "albums/" e "" decodeAlbum token
                , Http.send GetAlbumTracks <| Request.get "albums/" e "/tracks" decodeAlbumTracks token
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
            ( { model | drawer = { drawer | drawerAlbum = tracks } }
            , Cmd.none
            )

        GetAlbumTracks (Err e) ->
            ( model, Cmd.none )

        GetPlaylistTracks (Ok e) ->
            let
                trackss =
                    { catchDrawerPlaylist | tracks = e }
            in
            ( { model | drawer = { drawer | drawerPlaylist = trackss } }
            , Cmd.none
            )

        GetPlaylistTracks (Err _) ->
            ( model, Cmd.none )

        -- ARTIST
        Get id ->
            ( model
            , Cmd.batch
                [ Http.send GetArtist <| Request.get "artists/" id "" decodeArtist token
                , Http.send GetArtistAlbums <| Request.get "artists/" id "/albums?market=FR&album_type=album" decodeArtistAlbums token
                , Http.send GetArtistTopTracks <| Request.get "artists/" id "/top-tracks?country=FR" Track.decodeArtistTopTracks token
                , Http.send GetRelatedArtists <| Request.get "artists/" id "/related-artists" decodeRelatedArtists token
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
            ( model, Http.send PutSeekPosition <| Request.put "seek?position_ms=" e "" token )

        PutSeekPosition (Ok e) ->
            ( model, Cmd.none )

        PutSeekPosition (Err _) ->
            ( model, Cmd.none )

        ClickNext ->
            ( model, Http.send PostControls <| Request.post "" "next" "" token )

        ClickPrevious ->
            ( model, Http.send PostControls <| Request.post "" "previous" "" token )

        ClickPlay ->
            ( model, Http.send PostControls <| Request.put "" "play" "" token )

        ClickPause ->
            ( model, Http.send PostControls <| Request.put "" "pause" "" token )

        ClickShuffleOff ->
            ( model, Http.send PostControls <| Request.put "" "" "shuffle?state=false" token )

        ClickShuffleOn ->
            ( model, Http.send PostControls <| Request.put "" "" "shuffle?state=true" token )

        ClickRepeatOff ->
            ( model, Http.send PostControls <| Request.put "" "" "repeat?state=off" token )

        ClickRepeatOn ->
            ( model, Http.send PostControls <| Request.put "" "" "repeat?state=track" token )

        ChangePlaying e ->
            ( model, Http.send PlayAlbum <| Request.play e (encodeAlbum e) token )

        ChangePlayingTrack e ->
            ( model, Http.send PlayTrack <| Request.play e (encodeTrack e) token )

        SendPlayer _ ->
            ( model, Http.send GetPlayer <| Request.get "me/player" "" "" decodePlayer token )

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
                [ Http.send FindArtist <| Request.get "search?q=" (e ++ "*") "&type=artist&limit=10" decodeListArtist token
                , Http.send FindAlbum <| Request.get "search?q=" (e ++ "*") "&type=album&limit=13" decodeListAlbum token
                , Http.send FindTrack <| Request.get "search?q=" (e ++ "*") "&type=track&limit=16" decodeListTrack token
                ]
            )

        ClearQuery ->
            ( { model | searchModel = { searchModel | searchQuery = "" } }
            , Cmd.none
            )

        GoHome ->
            ( { model | drawer = { drawer | drawerType = Home } }, Cmd.none )

        GoReleases ->
            ( { model | drawer = { drawer | drawerType = Releases } }, Cmd.none )

        GoListen ->
            ( { model | drawer = { drawer | drawerType = Listen } }, Cmd.none )
