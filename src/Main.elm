module Main exposing (main)

import Browser
import Browser.Dom
import Browser.Events
import Browser.Navigation
import Data.Album
import Data.Artist
import Data.Counter
import Data.Date
import Data.Home
import Data.Meta
import Data.Player
import Data.Playlist
import Data.Search
import Data.Session
import Data.Track
import Html.Styled as Html exposing (..)
import Html.Styled.Attributes exposing (..)
import Html.Styled.Events exposing (onClick)
import Http
import Json.Decode as Decode exposing (..)
import Keyboard.Event
import Page.Album
import Page.Artist
import Page.Collection
import Page.Counter
import Page.Home
import Page.Playlist
import Ports
import Request
import Route
import Task
import Time
import Url exposing (Url)
import Views.Meta
import Views.Page
import Views.Player


type Page
    = Blank
    | HomePage Data.Home.Model
    | CounterPage Data.Counter.Model
    | CollectionPage Data.Meta.CollectionModel
    | PlaylistPage Data.Meta.PlaylistModel
    | AlbumPage Data.Meta.AlbumModel
    | ArtistPage Data.Meta.ArtistModel
    | NotFound


type alias Flags =
    { token : String
    , now : Int
    }


type alias Model =
    { config :
        { token : String
        , currentDate : Data.Date.Date
        }
    , page : Page
    , session : Data.Session.Session
    }


init : Flags -> Url -> Browser.Navigation.Key -> ( Model, Cmd Msg )
init flags url navKey =
    let
        session =
            { navKey = navKey
            , playlists = []
            , url = url
            , token = flags.token
            , player = Data.Player.init
            , search = Data.Search.init
            }

        timestamp =
            Time.millisToPosix flags.now

        ( model, cmds ) =
            setRoute (Route.fromUrl url)
                { config =
                    { token = flags.token
                    , currentDate =
                        { year = Time.toYear Time.utc timestamp
                        , month = Time.toMonth Time.utc timestamp
                        , day = Time.toDay Time.utc timestamp
                        , hour = Time.toHour Time.utc timestamp
                        , minute = Time.toMinute Time.utc timestamp
                        , second = Time.toSecond Time.utc timestamp
                        , milliSecond = Time.toMillis Time.utc timestamp
                        }
                    }
                , page = Blank
                , session = session
                }
    in
    ( model
    , Cmd.batch
        [ cmds
        , Http.send InitPlaylist <| Request.get "me/playlists" "" "?limit=50" Data.Playlist.decodePlaylistPagingSimplified flags.token
        ]
    )


setRoute : Maybe Route.Route -> Model -> ( Model, Cmd Msg )
setRoute maybeRoute model =
    let
        playlistInit =
            Page.Playlist.init

        collectionInit =
            Page.Collection.init

        albumInit =
            Page.Album.init

        artistInit =
            Page.Artist.init

        toPage page subInit subMsg =
            let
                ( subModel, subCmds ) =
                    subInit model.session
            in
            ( { model | page = page subModel }
            , Cmd.map subMsg subCmds
            )
    in
    case maybeRoute of
        Nothing ->
            ( { model | page = NotFound }
            , Cmd.none
            )

        Just Route.Home ->
            toPage HomePage Page.Home.init HomeMsg

        Just Route.Counter ->
            toPage CounterPage Page.Counter.init CounterMsg

        Just (Route.Collection id) ->
            toPage CollectionPage (collectionInit id) CollectionMsg

        Just (Route.Playlist id) ->
            toPage PlaylistPage (playlistInit id) PlaylistMsg

        Just (Route.Album id) ->
            toPage AlbumPage (albumInit id) AlbumMsg

        Just (Route.Artist id) ->
            toPage ArtistPage (artistInit id) ArtistMsg


type Msg
    = NoOp
    | NoOpResult (Result Http.Error ())
    | UrlChanged Url
    | UrlRequested Browser.UrlRequest
      -- PAGES
    | HomeMsg Page.Home.Msg
    | CounterMsg Page.Counter.Msg
    | CollectionMsg Page.Collection.Msg
    | PlaylistMsg Page.Playlist.Msg
    | AlbumMsg Page.Album.Msg
    | ArtistMsg Page.Artist.Msg
      -- SIDEBAR PLAYLISTS
    | InitPlaylist (Result Http.Error Data.Playlist.PlaylistPagingSimplified)
      -- PLAYER
    | SetPlayer (Result Http.Error Data.Player.Model)
    | GetPlayer Time.Posix
    | PlayerMsg Views.Player.Msg
      -- KEYBOARD
    | HandleKeyboardEvent Keyboard.Event.KeyboardEvent
      -- SEARCH
    | FindArtist (Result Http.Error (List Data.Artist.Artist))
    | FindAlbum (Result Http.Error (List Data.Album.Album))
    | FindTrack (Result Http.Error (List Data.Track.Track))
    | Query String


update : Msg -> Model -> ( Model, Cmd Msg )
update msg ({ page, session } as model) =
    let
        toPage toModel toMsg subUpdate subMsg subModel =
            let
                ( newModel, newCmd ) =
                    subUpdate subMsg subModel
            in
            ( { model | page = toModel newModel }
            , Cmd.map toMsg newCmd
            )

        token =
            model.config.token

        search =
            model.session.search
    in
    case ( msg, page ) of
        ( NoOp, _ ) ->
            ( model, Cmd.none )

        ( NoOpResult (Ok _), _ ) ->
            ( model, Cmd.none )

        ( NoOpResult (Err _), _ ) ->
            ( model, Cmd.none )

        -- PAGES
        ( UrlRequested urlRequest, _ ) ->
            case urlRequest of
                Browser.Internal url ->
                    ( { model | session = { session | url = url } }, Browser.Navigation.pushUrl session.navKey (Url.toString url) )

                Browser.External href ->
                    ( model, Browser.Navigation.load href )

        ( UrlChanged url, _ ) ->
            setRoute (Route.fromUrl url) { model | session = { session | url = url } }

        ( HomeMsg homeMsg, HomePage homeModel ) ->
            toPage HomePage HomeMsg (Page.Home.update session) homeMsg homeModel

        ( CounterMsg counterMsg, CounterPage counterModel ) ->
            toPage CounterPage CounterMsg (Page.Counter.update session) counterMsg counterModel

        ( CollectionMsg collectionMsg, CollectionPage collectionModel ) ->
            case collectionMsg of
                Page.Collection.PlayAlbum e ->
                    ( model, Http.send NoOpResult <| Request.play e (Data.Album.encodeAlbum e) token )

                _ ->
                    toPage CollectionPage CollectionMsg (Page.Collection.update session) collectionMsg collectionModel

        ( PlaylistMsg playlistMsg, PlaylistPage playlistModel ) ->
            case playlistMsg of
                Page.Playlist.PlayTracks e ->
                    ( model, Http.send NoOpResult <| Request.play e (Data.Track.encodeTrack e) token )

                _ ->
                    toPage PlaylistPage PlaylistMsg (Page.Playlist.update session) playlistMsg playlistModel

        ( AlbumMsg albumMsg, AlbumPage albumModel ) ->
            case albumMsg of
                Page.Album.PlayTracks e ->
                    ( model, Http.send NoOpResult <| Request.play e (Data.Track.encodeTrack e) token )

                Page.Album.PlayAlbum e ->
                    ( model, Http.send NoOpResult <| Request.play e (Data.Album.encodeAlbum e) token )

                _ ->
                    toPage AlbumPage AlbumMsg (Page.Album.update session) albumMsg albumModel

        ( ArtistMsg artistMsg, ArtistPage artistModel ) ->
            case artistMsg of
                Page.Artist.PlayTracks e ->
                    ( model, Http.send NoOpResult <| Request.play e (Data.Track.encodeTrack e) token )

                Page.Artist.PlayAlbum e ->
                    ( model, Http.send NoOpResult <| Request.play e (Data.Album.encodeAlbum e) token )

                _ ->
                    toPage ArtistPage ArtistMsg (Page.Artist.update session) artistMsg artistModel

        -- SIDEBAR PLAYLISTS
        ( InitPlaylist (Ok e), _ ) ->
            let
                concat =
                    model.session.playlists ++ e.items
            in
            ( { model | session = { session | playlists = concat } }
            , if e.next /= "" then
                Cmd.batch [ Http.send InitPlaylist <| Request.getPaging e.next Data.Playlist.decodePlaylistPagingSimplified token ]

              else
                Cmd.none
            )

        ( InitPlaylist (Err e), _ ) ->
            ( model, Cmd.none )

        -- PLAYER
        ( SetPlayer (Ok e), _ ) ->
            ( { model | session = { session | player = e } }, Cmd.none )

        ( SetPlayer (Err _), _ ) ->
            ( model, Ports.refreshToken () )

        ( GetPlayer _, _ ) ->
            ( model, Http.send SetPlayer <| Request.get "me/player" "" "" Data.Player.decodePlayer token )

        -- KEYBOARD
        ( HandleKeyboardEvent event, _ ) ->
            case ( event.shiftKey, event.key ) of
                ( _, Just "Escape" ) ->
                    ( { model
                        | session = { session | search = { search | searchQuery = "" } }

                        -- , modal = { modal | isOpen = False }
                      }
                    , Cmd.none
                    )

                -- ( _, Just " " ) ->
                --     if player.is_playing && model.searchModel.searchQuery == "" then
                --         ( model, Http.send PlayerControl <| Request.put "" "pause" "" token )
                --     else
                --         ( model, Http.send PlayerControl <| Request.put "" "play" "" token )
                ( True, Just "F" ) ->
                    ( model, Task.attempt (\_ -> NoOp) (Browser.Dom.focus "search") )

                ( _, _ ) ->
                    ( model, Cmd.none )

        -- SEARCH
        ( FindArtist (Ok artist), _ ) ->
            ( { model | session = { session | search = { search | findArtist = artist } } }
            , Cmd.none
            )

        ( FindArtist (Err _), _ ) ->
            ( model, Cmd.none )

        ( FindAlbum (Ok album), _ ) ->
            ( { model | session = { session | search = { search | findAlbum = album } } }
            , Cmd.none
            )

        ( FindAlbum (Err _), _ ) ->
            ( model, Cmd.none )

        ( FindTrack (Ok track), _ ) ->
            ( { model | session = { session | search = { search | findTrack = track } } }
            , Cmd.none
            )

        ( FindTrack (Err _), _ ) ->
            ( model, Cmd.none )

        ( PlayerMsg playerMsg, _ ) ->
            let
                ( playerModel, playerCmds ) =
                    Views.Player.update session playerMsg model.session.player
            in
            ( model, playerCmds |> Cmd.map PlayerMsg )

        ( Query e, _ ) ->
            ( { model | session = { session | search = { search | searchQuery = e } } }
            , Cmd.batch
                [ Http.send FindArtist <| Request.get "search?q=" (e ++ "*") "&type=artist&limit=10" (Decode.at [ "artists", "items" ] (Decode.list Data.Artist.decodeArtist)) token
                , Http.send FindAlbum <| Request.get "search?q=" (e ++ "*") "&type=album&limit=9" (Decode.at [ "albums", "items" ] (Decode.list Data.Album.decodeAlbum)) token
                , Http.send FindTrack <| Request.get "search?q=" (e ++ "*") "&type=track&limit=12" (Decode.at [ "tracks", "items" ] (Decode.list Data.Track.decodeTrack)) token
                ]
            )

        ( _, _ ) ->
            ( model, Cmd.none )


subscriptions : Model -> Sub Msg
subscriptions model =
    let
        commonSubs =
            [ Time.every 1000 GetPlayer
            , Browser.Events.onKeyDown (Decode.map HandleKeyboardEvent Keyboard.Event.decodeKeyboardEvent)
            ]
    in
    case model.page of
        HomePage _ ->
            Sub.batch commonSubs

        CounterPage _ ->
            Sub.batch commonSubs

        CollectionPage _ ->
            Sub.batch commonSubs

        PlaylistPage _ ->
            Sub.batch commonSubs

        AlbumPage _ ->
            Sub.batch commonSubs

        ArtistPage _ ->
            Sub.batch commonSubs

        NotFound ->
            Sub.batch commonSubs

        Blank ->
            Sub.batch commonSubs


view : Model -> Browser.Document Msg
view model =
    let
        pageConfig =
            Views.Page.Config model.session

        mapMsg msg ( title, content ) =
            ( title, content |> List.map (Html.map msg) )
    in
    case model.page of
        HomePage homeModel ->
            Page.Home.view model.session homeModel
                |> mapMsg HomeMsg
                |> Views.Page.frame (pageConfig Views.Page.Home) (Html.map PlayerMsg (Views.Player.view model.session.player))

        CounterPage counterModel ->
            Page.Counter.view model.session counterModel
                |> mapMsg CounterMsg
                |> Views.Page.frame (pageConfig Views.Page.Counter) (Views.Player.view model.session.player |> Html.map PlayerMsg)

        CollectionPage collectionModel ->
            Page.Collection.view model.session collectionModel
                |> mapMsg CollectionMsg
                |> Views.Page.frame (pageConfig Views.Page.Collection) (Views.Player.view model.session.player |> Html.map PlayerMsg)

        PlaylistPage playlistModel ->
            Page.Playlist.view model.session playlistModel
                |> mapMsg PlaylistMsg
                |> Views.Page.frame (pageConfig Views.Page.Playlist) (Views.Player.view model.session.player |> Html.map PlayerMsg)

        AlbumPage albumModel ->
            Page.Album.view model.session albumModel
                |> mapMsg AlbumMsg
                |> Views.Page.frame (pageConfig Views.Page.Album) (Views.Player.view model.session.player |> Html.map PlayerMsg)

        ArtistPage artistModel ->
            Page.Artist.view model.session artistModel
                |> mapMsg ArtistMsg
                |> Views.Page.frame (pageConfig Views.Page.Artist) (Views.Player.view model.session.player |> Html.map PlayerMsg)

        NotFound ->
            ( "Not Found", [ Html.text "Not found" ] )
                |> Views.Page.frame (pageConfig Views.Page.Other) (Views.Player.view model.session.player |> Html.map PlayerMsg)

        Blank ->
            ( "", [] )
                |> Views.Page.frame (pageConfig Views.Page.Other) (Views.Player.view model.session.player |> Html.map PlayerMsg)


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
