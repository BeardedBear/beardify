module Root exposing (Model, Msg(..), update)

import Browser exposing (Document)
import Data.Album exposing (..)
import Data.Artist exposing (..)
import Data.Drawer as Drawer exposing (..)
import Data.Modal as Modal exposing (..)
import Data.Player as Player exposing (..)
import Data.Playlist exposing (..)
import Data.Search as Search exposing (..)
import Data.Track as Track exposing (..)
import Data.Youtube exposing (..)
import Http exposing (..)
import Keyboard.Event
import Ports
import Request
import Time exposing (..)
import Url exposing (Url)


type alias Model =
    { config : { token : String }
    , playlists : List Playlists
    , drawer : Drawer.Model
    , searchModel : Search.Model
    , player : Player.Model
    , modal : Modal.Model
    }


type Msg
    = UrlChanged Url
    | UrlRequested Browser.UrlRequest
    | NoOp
    | SetPlaylists (Result Http.Error Playlistslist)
    | SetPlaylist (Result Http.Error Playlist)
    | SetCollection (Result Http.Error Playlist)
    | GetCollection String
    | GetPlaylist String
    | GetAlbum String
    | SetAlbum (Result Http.Error Album)
    | SetAlbumTracks (Result Http.Error AlbumTracks)
    | SetPlaylistTracks (Result Http.Error PlaylistPaging)
    | GetArtist String
    | SetArtist (Result Http.Error Artist)
    | SetArtistAlbums (Result Http.Error ListAlbum)
    | SetArtistTopTracks (Result Http.Error ArtistTopTracks)
    | SetRelatedArtists (Result Http.Error RelatedArtists)
    | SetPlayer (Result Http.Error Player.Model)
    | SetYoutube (Result Http.Error Youtube)
    | PlayerControl (Result Http.Error ())
    | PlayerSeek String
    | PlayerNext
    | PlayerPrevious
    | PlayerPlay
    | PlayerPause
    | PlayerShuffleOff
    | PlayerShuffleOn
    | PlayerRepeatOff
    | PlayerRepeatOn
    | FindArtist (Result Http.Error ListArtist)
    | FindAlbum (Result Http.Error ListAlbum)
    | FindTrack (Result Http.Error ListTrack)
    | Play (Result Http.Error ())
    | Query String
    | ChangePlaying String
    | ChangePlayingTrack (List String)
    | GetPlayer Posix
    | GoHome
    | GoReleases
    | GoListen
    | ModalOpen (Result Http.Error AlbumTracks)
    | ModalGetTrack String
    | ModalAddTrack String
    | SetModalTrack (Result Http.Error ())
    | ModalClear
    | DelCollectionAlbum String (List String)
    | HandleKeyboardEvent Keyboard.Event.KeyboardEvent


update : Msg -> Model -> ( Model, Cmd Msg )
update msg ({ searchModel, config, drawer, modal } as model) =
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

        NoOp ->
            ( model, Cmd.none )

        --  PLAYLIST/COLLECTION
        SetPlaylists (Ok e) ->
            ( { model | playlists = e.items }, Cmd.none )

        SetPlaylists (Err _) ->
            ( model, Cmd.none )

        SetPlaylist (Ok e) ->
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

        SetPlaylist (Err _) ->
            ( model, Cmd.none )

        SetCollection (Ok e) ->
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

        SetCollection (Err _) ->
            ( model, Cmd.none )

        GetPlaylist id ->
            ( model
            , Cmd.batch
                [ Http.send SetPlaylist <| Request.get "playlists/" id "" decodePlaylist token
                , Http.send SetPlaylistTracks <| Request.get "playlists/" id "/tracks" decodePlaylistPaging token
                ]
            )

        GetCollection id ->
            ( model
            , Cmd.batch
                [ Http.send SetCollection <| Request.get "playlists/" id "" decodePlaylist token
                , Http.send SetPlaylistTracks <| Request.get "playlists/" id "/tracks" decodePlaylistPaging token
                ]
            )

        -- ALBUM
        GetAlbum e ->
            ( { model | searchModel = { searchModel | searchQuery = "" } }
            , Cmd.batch
                [ Http.send SetAlbum <| Request.get "albums/" e "" decodeAlbum token
                , Http.send SetAlbumTracks <| Request.get "albums/" e "/tracks" decodeAlbumTracks token
                ]
            )

        SetAlbum (Ok e) ->
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

        SetAlbum (Err _) ->
            ( model, Cmd.none )

        SetAlbumTracks (Ok e) ->
            let
                tracks =
                    { catchDrawerAlbum | tracks = e.items }
            in
            ( { model | drawer = { drawer | drawerAlbum = tracks } }
            , Cmd.none
            )

        SetAlbumTracks (Err e) ->
            ( model, Cmd.none )

        SetPlaylistTracks (Ok e) ->
            let
                trackss =
                    { catchDrawerPlaylist | tracks = e }
            in
            ( { model | drawer = { drawer | drawerPlaylist = trackss } }
            , Cmd.none
            )

        SetPlaylistTracks (Err _) ->
            ( model, Cmd.none )

        -- ARTIST
        GetArtist id ->
            ( model
            , Cmd.batch
                [ Http.send SetArtist <| Request.get "artists/" id "" decodeArtist token
                , Http.send SetArtistAlbums <| Request.get "artists/" id "/albums?include_groups=album&market=from_token&limit=50" decodeArtistAlbums token
                , Http.send SetArtistTopTracks <| Request.get "artists/" id "/top-tracks?country=FR" Track.decodeArtistTopTracks token
                , Http.send SetRelatedArtists <| Request.get "artists/" id "/related-artists" decodeRelatedArtists token
                ]
            )

        SetArtist (Ok e) ->
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
            , Http.send SetYoutube <| getVideos e.name
            )

        SetArtist (Err _) ->
            ( model, Cmd.none )

        SetArtistAlbums (Ok e) ->
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

        SetArtistAlbums (Err _) ->
            ( model, Cmd.none )

        SetArtistTopTracks (Ok e) ->
            let
                topTracks =
                    { catchDrawerArtist | topTracks = e.tracks }
            in
            ( { model | drawer = { drawer | drawerArtist = topTracks } }, Cmd.none )

        SetArtistTopTracks (Err _) ->
            ( model, Cmd.none )

        SetRelatedArtists (Ok e) ->
            let
                artists =
                    { catchDrawerArtist | relatedArtists = e.artists }
            in
            ( { model | drawer = { drawer | drawerArtist = artists } }, Cmd.none )

        SetRelatedArtists (Err _) ->
            ( model, Cmd.none )

        SetYoutube (Ok e) ->
            let
                videos =
                    { catchDrawerArtist | videos = e.items }
            in
            ( { model | drawer = { drawer | drawerArtist = videos } }, Cmd.none )

        SetYoutube (Err _) ->
            ( model, Cmd.none )

        -- PLAYER
        SetPlayer (Ok e) ->
            ( { model | player = e }, Cmd.none )

        SetPlayer (Err _) ->
            ( model, Ports.refreshToken () )

        GetPlayer _ ->
            ( model, Http.send SetPlayer <| Request.get "me/player" "" "" decodePlayer token )

        PlayerControl (Ok e) ->
            ( model, Cmd.none )

        PlayerControl (Err _) ->
            ( model, Cmd.none )

        PlayerSeek e ->
            ( model, Http.send PlayerControl <| Request.put "seek?position_ms=" e "" token )

        PlayerNext ->
            ( model, Http.send PlayerControl <| Request.post "me/player/" "next" "" token )

        PlayerPrevious ->
            ( model, Http.send PlayerControl <| Request.post "me/player/" "previous" "" token )

        PlayerPlay ->
            ( model, Http.send PlayerControl <| Request.put "" "play" "" token )

        PlayerPause ->
            ( model, Http.send PlayerControl <| Request.put "" "pause" "" token )

        PlayerShuffleOff ->
            ( model, Http.send PlayerControl <| Request.put "" "" "shuffle?state=false" token )

        PlayerShuffleOn ->
            ( model, Http.send PlayerControl <| Request.put "" "" "shuffle?state=true" token )

        PlayerRepeatOff ->
            ( model, Http.send PlayerControl <| Request.put "" "" "repeat?state=off" token )

        PlayerRepeatOn ->
            ( model, Http.send PlayerControl <| Request.put "" "" "repeat?state=track" token )

        --  PLAY
        Play (Ok e) ->
            ( model, Cmd.none )

        Play (Err _) ->
            ( model, Cmd.none )

        ChangePlaying e ->
            ( model, Http.send Play <| Request.play e (encodeAlbum e) token )

        ChangePlayingTrack e ->
            ( { model
                | searchModel = { searchModel | searchQuery = "" }
              }
            , Http.send Play <| Request.play e (encodeTrack e) token
            )

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
                , Http.send FindAlbum <| Request.get "search?q=" (e ++ "*") "&type=album&limit=9" decodeListAlbum token
                , Http.send FindTrack <| Request.get "search?q=" (e ++ "*") "&type=track&limit=12" decodeListTrack token
                ]
            )

        -- DRAWER
        GoHome ->
            ( { model | drawer = { drawer | drawerType = Home } }, Cmd.none )

        GoReleases ->
            ( { model | drawer = { drawer | drawerType = Releases } }, Cmd.none )

        GoListen ->
            ( { model | drawer = { drawer | drawerType = Listen } }, Cmd.none )

        ModalOpen (Ok e) ->
            let
                firstTrack =
                    e.items
                        |> List.map (\f -> f.uri)
                        |> List.take 1
            in
            ( { model
                | modal =
                    { modal
                        | isOpen = True
                        , inPocket = firstTrack
                    }
              }
            , Cmd.none
            )

        ModalOpen (Err _) ->
            ( model, Cmd.none )

        ModalGetTrack e ->
            ( model
            , Cmd.batch
                [ Http.send ModalOpen <| Request.get "albums/" e "/tracks" decodeAlbumTracks token
                ]
            )

        ModalAddTrack e ->
            let
                listTracks =
                    String.concat model.modal.inPocket
            in
            ( model, Http.send SetModalTrack <| Request.post "playlists/" e ("/tracks?position=0&uris=" ++ listTracks) token )

        SetModalTrack (Ok e) ->
            ( { model | modal = { modal | isOpen = False } }
            , Cmd.none
            )

        SetModalTrack (Err e) ->
            ( model, Cmd.none )

        ModalClear ->
            ( { model | modal = { modal | isOpen = False } }
            , Cmd.none
            )

        DelCollectionAlbum p e ->
            ( model
            , Cmd.batch
                [ Http.send Play <| Request.delete "playlists/" p "/tracks" (encodeDelCollectionAlbum e) token
                ]
            )

        HandleKeyboardEvent event ->
            case event.key of
                Just "Escape" ->
                    ( { model
                        | searchModel = { searchModel | searchQuery = "" }
                        , modal = { modal | isOpen = False }
                      }
                    , Cmd.none
                    )

                Just _ ->
                    ( model, Cmd.none )

                Nothing ->
                    ( model, Cmd.none )
