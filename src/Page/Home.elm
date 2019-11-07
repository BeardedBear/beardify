module Page.Home exposing (Model, Msg(..), init, update, view)

import Data.Session exposing (Session)
import Html exposing (..)
import Html.Attributes exposing (..)
import Views.Player as Player
import Views.Sidebar as Sidebar
import Views.Topbar as Topbar


type alias Model =
    String


type Msg
    = NoOp


init : Session -> ( Model, Session, Cmd Msg )
init session =
    ( ""
    , session
    , Cmd.none
    )


update : Session -> Msg -> Model -> ( Model, Session, Cmd Msg )
update session msg model =
    case msg of
        NoOp ->
            ( model
            , session
            , Cmd.none
            )


view : Session -> Model -> ( String, List (Html Msg) )
view _ _ =
    ( "Home"
    , [ Topbar.view
      , div [ class "App__body" ]
            [ Sidebar.view
            , div [ class "Content" ]
                [ div [ class "Page" ] []
                , Player.view
                ]
            ]
      ]
    )
