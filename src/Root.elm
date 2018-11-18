module Root exposing (Model, Msg(..), update)

import Browser exposing (Document)
import Browser.Dom as Dom
import Data.Album exposing (..)
import Data.Artist exposing (..)
import Data.Date exposing (..)
import Data.Drawer as Drawer exposing (..)
import Data.Modal as Modal exposing (..)
import Data.Player as Player exposing (..)
import Data.Playlist exposing (..)
import Data.Releases as Releases exposing (..)
import Data.Search as Search exposing (..)
import Data.Track as Track exposing (..)
import Data.Youtube exposing (..)
import Http exposing (..)
import Json.Decode as Decode exposing (..)
import Keyboard.Event
import Ports
import Request
import Task
import Time exposing (..)
import Url exposing (Url)


type alias Model =
    { config :
        { token : String
        , openedMenu : Bool
        , currentDate : Date
        }
    , playlists : List PlaylistSimplified
    , drawer : Drawer.Model
    , searchModel : Search.Model
    , player : Player.Model
    , modal : Modal.Model
    , releases : Releases.Model
    }


type Msg
    = UrlChanged Url
    | UrlRequested Browser.UrlRequest
    | NoOp
    | SetPlaylists (Result Http.Error (List PlaylistSimplified))
    | SetPlaylist (Result Http.Error Playlist)
    | SetCollection (Result Http.Error Playlist)
    | GetCollection String
    | GetPlaylist String
    | GetAlbum String
    | SetAlbum (Result Http.Error Album)
    | SetAlbumTracks (Result Http.Error (List TrackSimplified))
    | SetPlaylistTracks (Result Http.Error PlaylistPaging)
    | SetPlaylistTracksPaging (Result Http.Error PlaylistPaging)
    | SetCollectionTracks (Result Http.Error PlaylistPaging)
    | SetCollectionTracksPaging (Result Http.Error PlaylistPaging)
    | GetArtist String
    | SetArtist (Result Http.Error Artist)
    | SetArtistAlbums (Result Http.Error (List Album))
    | SetArtistTopTracks (Result Http.Error (List Track))
    | SetRelatedArtists (Result Http.Error (List Artist))
    | SetPlayer (Result Http.Error Player.Model)
    | SetYoutube (Result Http.Error Youtube)
    | PlayerControl (Result Http.Error ())
    | PlayerSeek String
    | PlayerVolume String
    | PlayerVolumeToogleMute String
    | PlayerNext
    | PlayerPrevious
    | PlayerPlay
    | PlayerPause
    | PlayerShuffleOff
    | PlayerShuffleOn
    | PlayerRepeatOff
    | PlayerRepeatOn
    | FindArtist (Result Http.Error (List Artist))
    | FindAlbum (Result Http.Error (List Album))
    | FindTrack (Result Http.Error (List Track))
    | Play (Result Http.Error ())
    | Query String
    | ChangePlaying String
    | ChangePlayingTrack (List String)
    | GetPlayer Posix
    | GoHome
    | SetReleases (Result Http.Error (List Album))
    | GoReleases
    | GoListen
    | ModalOpen (Result Http.Error (List TrackSimplified))
    | ModalGetTrack String
    | ModalAddTrack String
    | SetModalTrack (Result Http.Error ())
    | ModalClear
    | DelCollectionAlbum String (List String)
    | HandleKeyboardEvent Keyboard.Event.KeyboardEvent
    | AddReleaseThePrp String
    | ToggleMenu


update : Msg -> Model -> ( Model, Cmd Msg )
update msg ({ searchModel, config, drawer, modal, releases, player } as model) =
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
            ( { model | playlists = e }, Cmd.none )

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
                , config = { config | openedMenu = False }
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
                , config = { config | openedMenu = False }
              }
            , Cmd.none
            )

        SetCollection (Err e) ->
            ( model, Cmd.none )

        SetPlaylistTracksPaging (Ok e) ->
            let
                concat =
                    model.drawer.drawerPlaylist.tracks.items ++ e.items
            in
            ( { model
                | drawer =
                    { drawer
                        | drawerPlaylist =
                            { playlist =
                                { id = ""
                                , images = []
                                , name = ""
                                , uri = ""
                                }
                            , tracks =
                                { items = concat
                                , next = ""
                                }
                            }
                    }
              }
            , if e.next /= "" then
                Cmd.batch [ Http.send SetPlaylistTracksPaging <| Request.getPaging e.next decodePlaylistPaging token ]

              else
                Cmd.none
            )

        SetPlaylistTracksPaging (Err _) ->
            ( model, Cmd.none )

        SetPlaylistTracks (Ok e) ->
            let
                trackss =
                    { catchDrawerPlaylist | tracks = e }
            in
            ( { model | drawer = { drawer | drawerPlaylist = trackss } }
            , if e.next /= "" then
                Cmd.batch [ Http.send SetPlaylistTracksPaging <| Request.getPaging e.next decodePlaylistPaging token ]

              else
                Cmd.none
            )

        SetPlaylistTracks (Err _) ->
            ( model, Cmd.none )

        SetCollectionTracksPaging (Ok e) ->
            let
                concat =
                    model.drawer.drawerCollection.tracks.items ++ e.items
            in
            ( { model
                | drawer =
                    { drawer
                        | drawerCollection =
                            { playlist =
                                { id = ""
                                , images = []
                                , name = ""
                                , uri = ""
                                }
                            , tracks =
                                { items = concat
                                , next = ""
                                }
                            }
                    }
              }
            , if e.next /= "" then
                Cmd.batch [ Http.send SetCollectionTracksPaging <| Request.getPaging e.next decodePlaylistPaging token ]

              else
                Cmd.none
            )

        SetCollectionTracksPaging (Err _) ->
            ( model, Cmd.none )

        SetCollectionTracks (Ok e) ->
            let
                trackss =
                    { catchDrawerCollection | tracks = e }
            in
            ( { model | drawer = { drawer | drawerCollection = trackss } }
            , if e.next /= "" then
                Cmd.batch [ Http.send SetCollectionTracksPaging <| Request.getPaging e.next decodePlaylistPaging token ]

              else
                Cmd.none
            )

        SetCollectionTracks (Err _) ->
            ( model, Cmd.none )

        GetPlaylist id ->
            ( model
            , Cmd.batch
                [ Http.send SetPlaylistTracks <| Request.get "playlists/" id "/tracks" decodePlaylistPaging token
                , Http.send SetPlaylist <| Request.get "playlists/" id "" decodePlaylist token
                ]
            )

        GetCollection id ->
            ( model
            , Cmd.batch
                [ Http.send SetCollection <| Request.get "playlists/" id "" decodePlaylist token
                , Http.send SetCollectionTracks <| Request.get "playlists/" id "/tracks" decodePlaylistPaging token
                ]
            )

        -- ALBUM
        GetAlbum e ->
            ( { model | searchModel = { searchModel | searchQuery = "" } }
            , Cmd.batch
                [ Http.send SetAlbum <| Request.get "albums/" e "" decodeAlbum token
                , Http.send SetAlbumTracks <| Request.get "albums/" e "/tracks" (Decode.at [ "items" ] (Decode.list decodeTrackSimplified)) token
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
                    { catchDrawerAlbum | tracks = e }
            in
            ( { model | drawer = { drawer | drawerAlbum = tracks } }
            , Cmd.none
            )

        SetAlbumTracks (Err e) ->
            ( model, Cmd.none )

        -- ARTIST
        GetArtist id ->
            ( model
            , Cmd.batch
                [ Http.send SetArtist <|
                    Request.get "artists/" id "" decodeArtist token
                , Http.send SetArtistAlbums <|
                    Request.get "artists/" id "/albums?market=FR&album_type=album" (Decode.at [ "items" ] (Decode.list decodeAlbum)) token
                , Http.send SetArtistTopTracks <|
                    Request.get "artists/" id "/top-tracks?country=FR" (Decode.at [ "tracks" ] (Decode.list decodeTrack)) token
                , Http.send SetRelatedArtists <|
                    Request.get "artists/" id "/related-artists" (Decode.at [ "artists" ] (Decode.list decodeArtist)) token
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
                    { catchDrawerArtist | albums = e }
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
                    { catchDrawerArtist | topTracks = e }
            in
            ( { model | drawer = { drawer | drawerArtist = topTracks } }, Cmd.none )

        SetArtistTopTracks (Err _) ->
            ( model, Cmd.none )

        SetRelatedArtists (Ok e) ->
            let
                artists =
                    { catchDrawerArtist | relatedArtists = e }
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

        PlayerVolume e ->
            ( model, Http.send PlayerControl <| Request.put "volume?volume_percent=" e "" token )

        PlayerVolumeToogleMute e ->
            ( model, Http.send PlayerControl <| Request.put "volume?volume_percent=" e "" token )

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
            ( { model | searchModel = { searchModel | findArtist = artist } }, Cmd.none )

        FindArtist (Err _) ->
            ( model, Cmd.none )

        FindAlbum (Ok album) ->
            ( { model | searchModel = { searchModel | findAlbum = album } }, Cmd.none )

        FindAlbum (Err _) ->
            ( model, Cmd.none )

        FindTrack (Ok track) ->
            ( { model | searchModel = { searchModel | findTrack = track } }, Cmd.none )

        FindTrack (Err _) ->
            ( model, Cmd.none )

        Query e ->
            ( { model | searchModel = { searchModel | searchQuery = e } }
            , Cmd.batch
                [ Http.send FindArtist <|
                    Request.get "search?q=" (e ++ "*") "&type=artist&limit=10" (Decode.at [ "artists", "items" ] (Decode.list decodeArtist)) token
                , Http.send FindAlbum <|
                    Request.get "search?q=" (e ++ "*") "&type=album&limit=9" (Decode.at [ "albums", "items" ] (Decode.list decodeAlbum)) token
                , Http.send FindTrack <|
                    Request.get "search?q=" (e ++ "*") "&type=track&limit=12" (Decode.at [ "tracks", "items" ] (Decode.list decodeTrack)) token
                ]
            )

        -- DRAWER
        GoHome ->
            ( { model
                | drawer = { drawer | drawerType = Home }
                , config = { config | openedMenu = False }
              }
            , Cmd.none
            )

        SetReleases (Ok e) ->
            ( { model | releases = { releases | releaseList = e } }, Cmd.none )

        SetReleases (Err _) ->
            ( model, Cmd.none )

        GoReleases ->
            ( { model
                | drawer = { drawer | drawerType = Releases }
                , config = { config | openedMenu = False }
              }
            , Cmd.batch
                [ Http.send SetReleases <|
                    Request.get "search?q=" "year:2018" "&type=album&limit=50" (Decode.at [ "albums", "items" ] (Decode.list decodeAlbum)) token
                , Ports.getReleasesThePRP ()
                ]
            )

        GoListen ->
            ( { model
                | drawer = { drawer | drawerType = Listen }
                , config = { config | openedMenu = False }
              }
            , Cmd.none
            )

        ModalOpen (Ok e) ->
            let
                firstTrack =
                    e
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
                [ Http.send ModalOpen <| Request.get "albums/" e "/tracks" (Decode.at [ "items" ] (Decode.list decodeTrackSimplified)) token
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
            case ( event.shiftKey, event.key ) of
                ( _, Just "Escape" ) ->
                    ( { model
                        | searchModel = { searchModel | searchQuery = "" }
                        , modal = { modal | isOpen = False }
                      }
                    , Cmd.none
                    )

                ( _, Just " " ) ->
                    if player.is_playing && model.searchModel.searchQuery == "" then
                        ( model, Http.send PlayerControl <| Request.put "" "pause" "" token )

                    else
                        ( model, Http.send PlayerControl <| Request.put "" "play" "" token )

                ( True, Just "F" ) ->
                    ( model, Task.attempt (\_ -> NoOp) (Dom.focus "search") )

                ( _, _ ) ->
                    ( model, Cmd.none )

        AddReleaseThePrp e ->
            let
                releaseList =
                    Decode.decodeString (Decode.list Releases.decodeThePrpReleases) e
            in
            ( { model | releases = { releases | thePrp = Result.withDefault [] releaseList } }, Cmd.none )

        ToggleMenu ->
            ( { model | config = { config | openedMenu = True } }, Cmd.none )
