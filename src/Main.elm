module Main exposing (main)

import Browser exposing (Document)
import Browser.Navigation as Nav
import Data.Authorization as Authorization
import Data.Player as PlayerData
import Data.Session as Session exposing (Notif, Session)
import Html exposing (..)
import Page.Home as Home
import Page.Login as Login
import Ports
import Route exposing (Route)
import Time exposing (Posix)
import Url exposing (Url)
import Views.Device as Device
import Views.Page as Page
import Views.Player as Player


type alias Flags =
    { clientUrl : String
    , rawStore : String
    , clientId : String
    , randomBytes : String
    , authUrl : String
    }


type Page
    = Blank
    | HomePage Home.Model
    | LoginPage Login.Model
    | NotFound


type alias Model =
    { page : Page
    , session : Session
    }


type Msg
    = ClearNotification Notif
    | RefreshNotifications Posix
    | HomeMsg Home.Msg
    | LoginMsg Login.Msg
    | PlayerMsg Player.Msg
    | DeviceMsg Device.Msg
    | StoreChanged String
    | UrlChanged Url
    | UrlRequested Browser.UrlRequest


setRoute : Maybe Route -> Model -> ( Model, Cmd Msg )
setRoute maybeRoute model =
    let
        toPage page subInit subMsg =
            let
                ( subModel, newSession, subCmds ) =
                    subInit model.session

                storeCmd =
                    if model.session.store /= newSession.store then
                        newSession.store |> Session.serializeStore |> Ports.saveStore

                    else
                        Cmd.none

                ( playerInit, playerCmd ) =
                    Player.init model.session

                ( deviceInit, deviceCmd ) =
                    Device.init model.session
            in
            ( { model
                | session =
                    { newSession | devices = deviceInit }
                        |> Session.updatePlayerContext playerInit
                , page = page subModel
              }
            , Cmd.batch
                [ Cmd.map subMsg subCmds
                , storeCmd
                , if model.session.store.auth /= Nothing then
                    Cmd.map PlayerMsg playerCmd

                  else
                    Cmd.none
                , if model.session.store.auth /= Nothing then
                    Cmd.map DeviceMsg deviceCmd

                  else
                    Cmd.none
                ]
            )
    in
    case ( model.session.store.auth /= Nothing, maybeRoute ) of
        ( _, Nothing ) ->
            ( { model | page = NotFound }
            , Cmd.none
            )

        ( True, Just Route.Home ) ->
            toPage HomePage Home.init HomeMsg

        ( True, Just Route.Login ) ->
            toPage LoginPage Login.init LoginMsg

        ( False, _ ) ->
            toPage LoginPage Login.init LoginMsg


init : Flags -> Url -> Nav.Key -> ( Model, Cmd Msg )
init flags url navKey =
    let
        session =
            { clientUrl = flags.clientUrl
            , navKey = navKey
            , clientId = flags.clientId
            , authUrl = flags.authUrl
            , randomBytes = flags.randomBytes
            , notifications = []
            , playerContext = PlayerData.defaultPlayerContext
            , devices = []
            , store = Session.deserializeStore flags.rawStore
            }
    in
    case ( url.fragment, url.query ) of
        ( Just fragment, Nothing ) ->
            case Authorization.parseAuth fragment of
                Authorization.Empty ->
                    setRoute (Route.fromUrl url)
                        { page = Blank
                        , session = session
                        }

                Authorization.AuthError _ ->
                    --TODO: How do we diplay us this error to user?
                    setRoute (Route.fromUrl url)
                        { page = Blank
                        , session = session
                        }

                Authorization.AuthSuccess auth ->
                    if auth.state /= session.store.state then
                        -- TODO: auth state is corrupted, we need display something to the user
                        ( { session = session, page = Blank }, Route.pushUrl session.navKey Route.Login )

                    else
                        let
                            newSession =
                                Session.updateAuth (Just auth) session
                        in
                        ( { session = newSession, page = Blank }
                        , Cmd.batch
                            [ newSession.store
                                |> Session.serializeStore
                                |> Ports.saveStore
                            , Route.pushUrl session.navKey Route.Home
                            ]
                        )

        -- Api spotify error use query string rather than fragment
        ( Nothing, Just query ) ->
            case Authorization.parseAuth query of
                Authorization.AuthError _ ->
                    setRoute (Route.fromUrl url)
                        { page = Blank
                        , session = session
                        }

                _ ->
                    setRoute (Route.fromUrl url)
                        { page = Blank
                        , session = session
                        }

        ( _, _ ) ->
            setRoute (Route.fromUrl url)
                { page = Blank
                , session = session
                }


update : Msg -> Model -> ( Model, Cmd Msg )
update msg ({ page, session } as model) =
    let
        toPage toModel toMsg subUpdate subMsg subModel =
            let
                ( newModel, newSession, newCmd ) =
                    subUpdate session subMsg subModel

                storeCmd =
                    if session.store /= newSession.store then
                        newSession.store |> Session.serializeStore |> Ports.saveStore

                    else
                        Cmd.none
            in
            ( { model | session = newSession, page = toModel newModel }
            , Cmd.map toMsg
                (Cmd.batch
                    [ newCmd
                    , storeCmd
                    , if newSession.store.auth == Nothing then
                        Route.pushUrl session.navKey Route.Login

                      else
                        Cmd.none
                    ]
                )
            )
    in
    case ( msg, page ) of
        ( ClearNotification notif, _ ) ->
            ( { model | session = session |> Session.closeNotification notif }
            , Cmd.none
            )

        ( DeviceMsg deviceMsg, _ ) ->
            let
                ( deviceModel, newSession, deviceCmd ) =
                    Device.update session deviceMsg session.devices

                playerContext =
                    model.session.playerContext

                updateContext context =
                    { context | refreshTick = 1000 }
            in
            case deviceMsg of
                Device.Activated (Ok _) ->
                    ( { model | session = { newSession | playerContext = updateContext model.session.playerContext } }
                    , Cmd.batch
                        [ Cmd.map DeviceMsg deviceCmd ]
                    )

                _ ->
                    ( { model | session = { newSession | devices = deviceModel } }
                    , Cmd.batch
                        [ Cmd.map DeviceMsg deviceCmd ]
                    )

        ( HomeMsg homeMsg, HomePage homeModel ) ->
            toPage HomePage HomeMsg Home.update homeMsg homeModel

        ( LoginMsg loginMsg, LoginPage loginModel ) ->
            toPage LoginPage LoginMsg Login.update loginMsg loginModel

        ( PlayerMsg playerMsg, _ ) ->
            let
                ( playerModel, newSession, playerCmd ) =
                    Player.update session playerMsg session.playerContext
            in
            ( { model | session = Session.updatePlayerContext playerModel newSession }
            , Cmd.batch
                [ Cmd.map PlayerMsg playerCmd
                ]
            )

        ( StoreChanged json, _ ) ->
            ( { model | session = { session | store = Session.deserializeStore json } }
            , Cmd.none
            )

        ( UrlRequested urlRequest, _ ) ->
            case urlRequest of
                Browser.Internal url ->
                    ( model, Nav.pushUrl session.navKey (Url.toString url) )

                Browser.External href ->
                    ( model, Nav.load href )

        ( UrlChanged url, _ ) ->
            setRoute (Route.fromUrl url) model

        ( RefreshNotifications _, _ ) ->
            ( { model | session = session |> Session.tickNotifications Session.notificationTick }
            , Cmd.none
            )

        ( _, NotFound ) ->
            ( { model | page = NotFound }, Cmd.none )

        ( _, _ ) ->
            ( model, Cmd.none )


subscriptions : Model -> Sub Msg
subscriptions model =
    Sub.batch
        [ Ports.storeChanged StoreChanged
        , if List.length model.session.notifications > 0 then
            Time.every Session.notificationTick RefreshNotifications

          else
            Sub.none
        , Player.subscriptions model.session.playerContext
            |> Sub.map PlayerMsg
        , case model.page of
            HomePage homeModel ->
                Home.subscriptions homeModel
                    |> Sub.map HomeMsg

            LoginPage _ ->
                Sub.none

            NotFound ->
                Sub.none

            Blank ->
                Sub.none
        ]


view : Model -> Document Msg
view { page, session } =
    let
        frame =
            Page.frame
                { session = session
                , clearNotification = ClearNotification
                , playerMsg = PlayerMsg
                , deviceMsg = DeviceMsg
                }

        mapMsg msg ( title, content ) =
            ( title, content |> List.map (Html.map msg) )
    in
    case page of
        HomePage homeModel ->
            Home.view session homeModel
                |> mapMsg HomeMsg
                |> frame

        LoginPage loginModel ->
            Login.view session loginModel
                |> mapMsg LoginMsg
                |> frame

        NotFound ->
            ( "Not Found", [ Html.text "Not found" ] )
                |> frame

        Blank ->
            ( "", [] )
                |> frame


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
