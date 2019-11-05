module Page.Home exposing (Model, Msg(..), init, update, view)

import Data.Session exposing (Session)
import Html exposing (..)


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
    , [ div [] [ text "hello" ]
      ]
    )
