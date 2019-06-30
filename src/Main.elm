module Main exposing (main)

import Browser
import Browser.Dom exposing (focus)
import Browser.Events exposing (onKeyDown)
import Browser.Navigation exposing (Key, load, pushUrl)
import Data.Album exposing (encodeAlbum)
import Data.Date exposing (Date)
import Data.Meta exposing (AlbumModel, ArtistModel, CollectionModel, PlaylistModel)
import Data.Player exposing (PlayerModel, decodePlayer, playerInit)
import Data.Playlist exposing (PlaylistPagingSimplified, decodePlaylistPagingSimplified)
import Data.Search exposing (searchInit)
import Data.Session exposing (Session)
import Data.Track exposing (encodeTrack)
import Html exposing (map)
import Http
import Json.Decode as Decode exposing (map)
import Keyboard.Event exposing (KeyboardEvent, decodeKeyboardEvent)
import Page.Album
import Page.Artist
import Page.Collection
import Page.Home
import Page.Playlist
import Ports
import Request
import Route
import Task
import Time
import Url exposing (Url)
import Views.Page
import Views.Player
import Views.Search


type Page
    = Blank
    | HomePage String
    | CollectionPage CollectionModel
    | PlaylistPage PlaylistModel
    | AlbumPage AlbumModel
    | ArtistPage ArtistModel
    | NotFound


type alias Flags =
    { token : String
    , now : Int
    }


type alias Model =
    { config :
        { token : String
        , currentDate : Date
        }
    , page : Page
    , session : Session
    }


init : Flags -> Url -> Key -> ( Model, Cmd Msg )
init flags url navKey =
    let
        session =
            { navKey = navKey
            , playlists = []
            , url = url
            , token = flags.token
            , player = playerInit
            , search = searchInit
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
        , Http.send InitPlaylist <| Request.get "me/playlists" "" "?limit=50" decodePlaylistPagingSimplified flags.token
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
    | CollectionMsg Page.Collection.Msg
    | PlaylistMsg Page.Playlist.Msg
    | AlbumMsg Page.Album.Msg
    | ArtistMsg Page.Artist.Msg
      -- SIDEBAR PLAYLISTS
    | InitPlaylist (Result Http.Error PlaylistPagingSimplified)
      -- PLAYER
    | SetPlayer (Result Http.Error PlayerModel)
    | GetPlayer Time.Posix
    | PlayerMsg Views.Player.Msg
    | SearchMsg Views.Search.Msg
      -- KEYBOARD
    | HandleKeyboardEvent KeyboardEvent


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
                    ( { model | session = { session | url = url } }, pushUrl session.navKey (Url.toString url) )

                Browser.External href ->
                    ( model, load href )

        ( UrlChanged url, _ ) ->
            setRoute (Route.fromUrl url) { model | session = { session | url = url } }

        ( HomeMsg homeMsg, HomePage homeModel ) ->
            toPage HomePage HomeMsg (Page.Home.update session) homeMsg homeModel

        ( CollectionMsg collectionMsg, CollectionPage collectionModel ) ->
            case collectionMsg of
                Page.Collection.PlayAlbum e ->
                    ( model, Http.send NoOpResult <| Request.play e (encodeAlbum e) token )

                _ ->
                    toPage CollectionPage CollectionMsg (Page.Collection.update session) collectionMsg collectionModel

        ( PlaylistMsg playlistMsg, PlaylistPage playlistModel ) ->
            case playlistMsg of
                Page.Playlist.PlayTracks e ->
                    ( model, Http.send NoOpResult <| Request.play e (encodeTrack e) token )

                _ ->
                    toPage PlaylistPage PlaylistMsg (Page.Playlist.update session) playlistMsg playlistModel

        ( AlbumMsg albumMsg, AlbumPage albumModel ) ->
            case albumMsg of
                Page.Album.PlayTracks e ->
                    ( model, Http.send NoOpResult <| Request.play e (encodeTrack e) token )

                Page.Album.PlayAlbum e ->
                    ( model, Http.send NoOpResult <| Request.play e (encodeAlbum e) token )

                _ ->
                    toPage AlbumPage AlbumMsg (Page.Album.update session) albumMsg albumModel

        ( ArtistMsg artistMsg, ArtistPage artistModel ) ->
            case artistMsg of
                Page.Artist.PlayTracks e ->
                    ( model, Http.send NoOpResult <| Request.play e (encodeTrack e) token )

                Page.Artist.PlayAlbum e ->
                    ( model, Http.send NoOpResult <| Request.play e (encodeAlbum e) token )

                _ ->
                    toPage ArtistPage ArtistMsg Page.Artist.update artistMsg artistModel

        -- SIDEBAR PLAYLISTS
        ( InitPlaylist (Ok e), _ ) ->
            let
                concat =
                    model.session.playlists ++ e.items
            in
            ( { model | session = { session | playlists = concat } }
            , if e.next /= "" then
                Cmd.batch [ Http.send InitPlaylist <| Request.getPaging e.next decodePlaylistPagingSimplified token ]

              else
                Cmd.none
            )

        ( InitPlaylist (Err _), _ ) ->
            ( model, Cmd.none )

        -- PLAYER
        ( SetPlayer (Ok e), _ ) ->
            ( { model | session = { session | player = e } }, Cmd.none )

        ( SetPlayer (Err _), _ ) ->
            ( model, Ports.refreshToken () )

        ( GetPlayer _, _ ) ->
            ( model, Http.send SetPlayer <| Request.get "me/player" "" "" decodePlayer token )

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
                    ( model, Task.attempt (\_ -> NoOp) (focus "search") )

                ( _, _ ) ->
                    ( model, Cmd.none )

        ( PlayerMsg playerMsg, _ ) ->
            let
                ( _, playerCmds ) =
                    Views.Player.update session playerMsg model.session.player
            in
            ( model, playerCmds |> Cmd.map PlayerMsg )

        ( SearchMsg searchMsg, _ ) ->
            let
                ( searchModel, searchCmds ) =
                    Views.Search.update searchMsg model.session.search

                newSession search_ =
                    { session | search = search_ }
            in
            case searchMsg of
                Views.Search.PlayTrack uri ->
                    ( { model | session = newSession searchModel }, Http.send NoOpResult <| Request.play [ uri ] (encodeTrack [ uri ]) token )

                _ ->
                    ( { model | session = newSession searchModel }, searchCmds |> Cmd.map SearchMsg )

        ( _, _ ) ->
            ( model, Cmd.none )


subscriptions : Model -> Sub Msg
subscriptions model =
    let
        commonSubs =
            [ Time.every 1000 GetPlayer
            , onKeyDown (Decode.map HandleKeyboardEvent decodeKeyboardEvent)
            ]
    in
    case model.page of
        HomePage _ ->
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
        player =
            Views.Player.view model.session.player |> Html.map PlayerMsg

        search =
            Views.Search.view model.session model.session.search |> Html.map SearchMsg

        pageConfig =
            Views.Page.Config model.session

        mapMsg msg ( title, content ) =
            ( title, content |> List.map (Html.map msg) )
    in
    case model.page of
        HomePage homeModel ->
            Page.Home.view model.session homeModel
                |> mapMsg HomeMsg
                |> Views.Page.frame (pageConfig Views.Page.Home) player search

        CollectionPage collectionModel ->
            Page.Collection.view model.session collectionModel
                |> mapMsg CollectionMsg
                |> Views.Page.frame (pageConfig Views.Page.Collection) player search

        PlaylistPage playlistModel ->
            Page.Playlist.view model.session playlistModel
                |> mapMsg PlaylistMsg
                |> Views.Page.frame (pageConfig Views.Page.Playlist) player search

        AlbumPage albumModel ->
            Page.Album.view model.session albumModel
                |> mapMsg AlbumMsg
                |> Views.Page.frame (pageConfig Views.Page.Album) player search

        ArtistPage artistModel ->
            Page.Artist.view model.session artistModel
                |> mapMsg ArtistMsg
                |> Views.Page.frame (pageConfig Views.Page.Artist) player search

        NotFound ->
            ( "Not Found", [ Html.text "Not found" ] )
                |> Views.Page.frame (pageConfig Views.Page.Other) player search

        Blank ->
            ( "", [] )
                |> Views.Page.frame (pageConfig Views.Page.Other) player search


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
