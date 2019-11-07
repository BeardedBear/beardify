module Main exposing (main)

import Browser exposing (Document)
import Browser.Navigation as Nav
import Data.Authorization as Authorization
import Data.Session as Session exposing (Session)
import Html exposing (..)
import Page.Home as Home
import Page.Login as Login
import Ports
import Route exposing (Route)
import Url exposing (Url)
import Views.Page as Page


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
    = HomeMsg Home.Msg
    | LoginMsg Login.Msg
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
            in
            ( { model | session = newSession, page = page subModel }
            , Cmd.batch [ Cmd.map subMsg subCmds, storeCmd ]
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
            , state = flags.randomBytes
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

                Authorization.AuthError err ->
                    setRoute (Route.fromUrl url)
                        { page = Blank
                        , session = session
                        }

                Authorization.AuthSuccess auth ->
                    let
                        updateStore store =
                            { store | auth = Just auth }

                        ( model, newSession, cmd ) =
                            Home.init session
                    in
                    ( { session = newSession, page = HomePage model }
                    , Cmd.batch
                        [ Cmd.map HomeMsg cmd
                        , newSession.store
                            |> updateStore
                            |> Session.serializeStore
                            |> Ports.saveStore
                        ]
                    )

        ( Nothing, Just query ) ->
            case Authorization.parseAuth query of
                Authorization.AuthError err ->
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
            , Cmd.map toMsg (Cmd.batch [ newCmd, storeCmd ])
            )
    in
    case ( msg, page ) of
        ( HomeMsg homeMsg, HomePage homeModel ) ->
            toPage HomePage HomeMsg Home.update homeMsg homeModel

        ( LoginMsg loginMsg, LoginPage loginModel ) ->
            toPage LoginPage LoginMsg Login.update loginMsg loginModel

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

        ( _, NotFound ) ->
            ( { model | page = NotFound }, Cmd.none )

        ( _, _ ) ->
            ( model, Cmd.none )


subscriptions : Model -> Sub Msg
subscriptions model =
    Sub.batch
        [ Ports.storeChanged StoreChanged
        , case model.page of
            HomePage _ ->
                Sub.none

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
        pageConfig =
            Page.Config session

        mapMsg msg ( title, content ) =
            ( title, content |> List.map (Html.map msg) )
    in
    case page of
        HomePage homeModel ->
            Home.view session homeModel
                |> mapMsg HomeMsg
                |> Page.frame (pageConfig Page.Home)

        LoginPage loginModel ->
            Login.view session loginModel
                |> mapMsg LoginMsg
                |> Page.frame (pageConfig Page.Home)

        NotFound ->
            ( "Not Found", [ Html.text "Not found" ] )
                |> Page.frame (pageConfig Page.Other)

        Blank ->
            ( "", [] )
                |> Page.frame (pageConfig Page.Other)


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
