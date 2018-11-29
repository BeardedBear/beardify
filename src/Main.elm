module Main exposing (main)

import Browser exposing (Document)
import Browser.Dom
import Browser.Events
import Browser.Navigation as Nav
import Data.Album
import Data.Artist
import Data.Date as Date exposing (Date)
import Data.Meta
import Data.Player
import Data.Playlist exposing (..)
import Data.Search
import Data.Session exposing (Session)
import Data.Track
import Html.Styled as Html exposing (..)
import Html.Styled.Attributes exposing (..)
import Html.Styled.Events exposing (onClick)
import Http
import Json.Decode as Decode exposing (..)
import Keyboard.Event
import Meta
import Page.Album
import Page.Artist
import Page.Collection
import Page.Counter
import Page.Home
import Page.Playlist
import Ports
import Request.Request as Request
import Route exposing (Route)
import Task
import Time exposing (..)
import Url exposing (Url)
import Views.Meta
import Views.Page as Page


type alias Flags =
    { token : String
    , now : Int
    }


init : Flags -> Url -> Nav.Key -> ( Meta.Model, Cmd Msg )
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
                        { year = Time.toYear utc timestamp
                        , month = Time.toMonth utc timestamp
                        , day = Time.toDay utc timestamp
                        , hour = Time.toHour utc timestamp
                        , minute = Time.toMinute utc timestamp
                        , second = Time.toSecond utc timestamp
                        , milliSecond = Time.toMillis utc timestamp
                        }
                    }
                , page = Meta.Blank
                , session = session
                }
    in
    ( model
    , Cmd.batch
        [ cmds
        , Http.send InitPlaylist <| Request.get "me/playlists" "" "?limit=50" decodePlaylistPagingSimplified flags.token
        ]
    )


setRoute : Maybe Route.Route -> Meta.Model -> ( Meta.Model, Cmd Msg )
setRoute maybeRoute model =
    let
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
            ( { model | page = Meta.NotFound }
            , Cmd.none
            )

        Just Route.Home ->
            toPage Meta.HomePage Page.Home.init HomeMsg

        Just Route.Counter ->
            toPage Meta.CounterPage Page.Counter.init CounterMsg

        Just (Route.Collection id) ->
            toPage Meta.CollectionPage Page.Collection.init CollectionMsg

        Just (Route.Playlist id) ->
            toPage Meta.PlaylistPage Page.Playlist.init PlaylistMsg

        Just (Route.Album id) ->
            toPage Meta.AlbumPage Page.Album.init AlbumMsg

        Just (Route.Artist id) ->
            toPage Meta.ArtistPage Page.Artist.init ArtistMsg


type Msg
    = NoOp
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
    | GetPlayer Posix
      -- KEYBOARD
    | HandleKeyboardEvent Keyboard.Event.KeyboardEvent
      -- COMMON
    | MetaMsg Meta.Msg


update : Msg -> Meta.Model -> ( Meta.Model, Cmd Msg )
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

        -- PAGES
        ( UrlRequested urlRequest, _ ) ->
            case urlRequest of
                Browser.Internal url ->
                    ( { model | session = { session | url = url } }, Nav.pushUrl session.navKey (Url.toString url) )

                Browser.External href ->
                    ( model, Nav.load href )

        ( UrlChanged url, _ ) ->
            setRoute (Route.fromUrl url) { model | session = { session | url = url } }

        ( HomeMsg homeMsg, Meta.HomePage homeModel ) ->
            toPage Meta.HomePage HomeMsg (Page.Home.update session) homeMsg homeModel

        ( CounterMsg counterMsg, Meta.CounterPage counterModel ) ->
            toPage Meta.CounterPage CounterMsg (Page.Counter.update session) counterMsg counterModel

        ( CollectionMsg collectionMsg, Meta.CollectionPage collectionModel ) ->
            toPage Meta.CollectionPage CollectionMsg (Page.Collection.update session) collectionMsg collectionModel

        ( PlaylistMsg playlistMsg, Meta.PlaylistPage playlistModel ) ->
            toPage Meta.PlaylistPage PlaylistMsg (Page.Playlist.update session) playlistMsg playlistModel

        ( AlbumMsg albumMsg, Meta.AlbumPage albumModel ) ->
            toPage Meta.AlbumPage AlbumMsg (Page.Album.update session) albumMsg albumModel

        ( ArtistMsg artistMsg, Meta.ArtistPage artistModel ) ->
            toPage Meta.ArtistPage ArtistMsg (Page.Artist.update session) artistMsg artistModel

        -- -- SIDEBAR PLAYLISTS
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

        -- COMMON
        ( MetaMsg e, _ ) ->
            let
                ( _, newCmd ) =
                    Meta.update e model
            in
            ( model
            , Cmd.map MetaMsg newCmd
            )

        ( _, _ ) ->
            ( model, Cmd.none )


subscriptions : Meta.Model -> Sub Msg
subscriptions model =
    let
        commonSubs =
            [ Time.every 1000 GetPlayer
            , Browser.Events.onKeyDown (Decode.map HandleKeyboardEvent Keyboard.Event.decodeKeyboardEvent)
            ]
    in
    case model.page of
        Meta.HomePage _ ->
            Sub.batch commonSubs

        Meta.CounterPage _ ->
            Sub.batch commonSubs

        Meta.CollectionPage _ ->
            Sub.batch commonSubs

        Meta.PlaylistPage _ ->
            Sub.batch commonSubs

        Meta.AlbumPage _ ->
            Sub.batch commonSubs

        Meta.ArtistPage _ ->
            Sub.batch commonSubs

        Meta.NotFound ->
            Sub.batch commonSubs

        Meta.Blank ->
            Sub.batch commonSubs


view : Meta.Model -> Document Msg
view model =
    let
        pageConfig =
            Views.Meta.Config model.session

        mapMsg msg ( title, content ) =
            ( title, content |> List.map (Html.map msg) )
    in
    case model.page of
        Meta.HomePage homeModel ->
            Page.Home.view model.session homeModel
                |> mapMsg HomeMsg
                |> Page.frame (pageConfig Views.Meta.Home)

        Meta.CounterPage counterModel ->
            Page.Counter.view model.session counterModel
                |> mapMsg CounterMsg
                |> Page.frame (pageConfig Views.Meta.Counter)

        Meta.CollectionPage collectionModel ->
            Page.Collection.view model.session collectionModel
                |> mapMsg CollectionMsg
                |> Page.frame (pageConfig Views.Meta.Collection)

        Meta.PlaylistPage playlistModel ->
            Page.Playlist.view model.session playlistModel
                |> mapMsg PlaylistMsg
                |> Page.frame (pageConfig Views.Meta.Playlist)

        Meta.AlbumPage albumModel ->
            Page.Album.view model.session albumModel
                |> mapMsg AlbumMsg
                |> Page.frame (pageConfig Views.Meta.Album)

        Meta.ArtistPage artistModel ->
            Page.Artist.view model.session artistModel
                |> mapMsg ArtistMsg
                |> Page.frame (pageConfig Views.Meta.Artist)

        Meta.NotFound ->
            ( "Not Found", [ Html.text "Not found" ] )
                |> Page.frame (pageConfig Views.Meta.Other)

        Meta.Blank ->
            ( "", [] )
                |> Page.frame (pageConfig Views.Meta.Other)


main : Program Flags Meta.Model Msg
main =
    Browser.application
        { init = init
        , view = view
        , update = update
        , subscriptions = subscriptions
        , onUrlChange = UrlChanged
        , onUrlRequest = UrlRequested
        }
