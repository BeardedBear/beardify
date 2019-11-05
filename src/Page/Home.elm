module Page.Home exposing (Model, Msg(..), init, update, view)

import Browser exposing (Document)
import Data.Session exposing (Session)
import Html exposing (..)
import Http
import Task


type alias Model =
    { readme : String
    }


type Msg
    = NoOp


init : Session -> ( Model, Session, Cmd Msg )
init session =
    ( { readme = "Retrieving README from github" }
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
view _ model =
    ( "Home"
    , [ div [] [ text "hello" ]
      ]
    )
