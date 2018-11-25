module Main exposing (main)

import Browser exposing (Document)
import Browser.Navigation as Nav
import Data.Collection
import Data.Date as Date exposing (Date)
import Data.Playlist exposing (..)
import Data.Session exposing (Session)
import Html.Styled as Html exposing (..)
import Http
import Page.Collection as Collection
import Page.Counter as Counter
import Page.Home as Home
import Request.Request as Request
import Route exposing (Route)
import Time exposing (..)
import Url exposing (Url)
import Views.Page as Page
import Views.Root as Root


type alias Flags =
    { token : String
    , now : Int
    }


type Page
    = Blank
    | HomePage Home.Model
    | CounterPage Counter.Model
    | CollectionPage Data.Collection.Model
    | NotFound


type alias Model =
    { config :
        { token : String
        , currentDate : Date
        }
    , page : Page
    , session : Session
    }


type Msg
    = HomeMsg Home.Msg
    | CounterMsg Counter.Msg
    | CollectionMsg Collection.Msg
    | UrlChanged Url
    | UrlRequested Browser.UrlRequest
    | InitPlaylist (Result Http.Error PlaylistPagingSimplified)
    | InitPlaylistPaging (Result Http.Error PlaylistPagingSimplified)


setRoute : Maybe Route -> Model -> ( Model, Cmd Msg )
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
            ( { model | page = NotFound }
            , Cmd.none
            )

        Just Route.Home ->
            toPage HomePage Home.init HomeMsg

        Just Route.Counter ->
            toPage CounterPage Counter.init CounterMsg

        Just (Route.Collection id) ->
            toPage CollectionPage Collection.init CollectionMsg


init : Flags -> Url -> Nav.Key -> ( Model, Cmd Msg )
init flags url navKey =
    let
        session =
            { navKey = navKey
            , playlists = []
            , url = url
            , token = flags.token
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
    in
    case ( msg, page ) of
        ( HomeMsg homeMsg, HomePage homeModel ) ->
            toPage HomePage HomeMsg (Home.update session) homeMsg homeModel

        ( CounterMsg counterMsg, CounterPage counterModel ) ->
            toPage CounterPage CounterMsg (Counter.update session) counterMsg counterModel

        ( CollectionMsg collectionMsg, CollectionPage collectionModel ) ->
            toPage CollectionPage CollectionMsg (Collection.update session) collectionMsg collectionModel

        ( UrlRequested urlRequest, _ ) ->
            case urlRequest of
                Browser.Internal url ->
                    ( { model | session = { session | url = url } }, Nav.pushUrl session.navKey (Url.toString url) )

                Browser.External href ->
                    ( model, Nav.load href )

        ( UrlChanged url, _ ) ->
            setRoute (Route.fromUrl url) { model | session = { session | url = url } }

        ( _, NotFound ) ->
            ( { model | page = NotFound }, Cmd.none )

        ( InitPlaylistPaging (Ok e), _ ) ->
            let
                sessionModel =
                    model.session

                concat =
                    model.session.playlists ++ e.items
            in
            ( { model | session = { sessionModel | playlists = concat } }
            , if e.next /= "" then
                Cmd.batch [ Http.send InitPlaylistPaging <| Request.getPaging e.next decodePlaylistPagingSimplified token ]

              else
                Cmd.none
            )

        ( InitPlaylistPaging (Err _), _ ) ->
            ( model, Cmd.none )

        ( InitPlaylist (Ok e), _ ) ->
            let
                sessionModel =
                    model.session
            in
            ( { model | session = { sessionModel | playlists = e.items } }
            , if e.next /= "" then
                Cmd.batch [ Http.send InitPlaylistPaging <| Request.getPaging e.next decodePlaylistPagingSimplified token ]

              else
                Cmd.none
            )

        ( InitPlaylist (Err e), _ ) ->
            ( model, Cmd.none )

        ( _, _ ) ->
            ( model, Cmd.none )


subscriptions : Model -> Sub Msg
subscriptions model =
    case model.page of
        HomePage _ ->
            Sub.none

        CounterPage _ ->
            Sub.none

        CollectionPage _ ->
            Sub.none

        NotFound ->
            Sub.none

        Blank ->
            Sub.none


view : Model -> Document Msg
view model =
    let
        pageConfig =
            Root.Config model.session

        mapMsg msg ( title, content ) =
            ( title, content |> List.map (Html.map msg) )
    in
    case model.page of
        HomePage homeModel ->
            Home.view model.session homeModel
                |> mapMsg HomeMsg
                |> Page.frame (pageConfig Root.Home)

        CounterPage counterModel ->
            Counter.view model.session counterModel
                |> mapMsg CounterMsg
                |> Page.frame (pageConfig Root.Counter)

        CollectionPage collectionModel ->
            Collection.view model.session collectionModel
                |> mapMsg CollectionMsg
                |> Page.frame (pageConfig Root.Collection)

        NotFound ->
            ( "Not Found", [ Html.text "Not found" ] )
                |> Page.frame (pageConfig Root.Other)

        Blank ->
            ( "", [] )
                |> Page.frame (pageConfig Root.Other)


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
