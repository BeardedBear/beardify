module Page.Counter exposing (Model, Msg, init, update, view)

import Css exposing (fontSize, marginRight)
import Data.Session exposing (Session)
import Html.Styled as Html exposing (..)
import Html.Styled.Attributes exposing (..)
import Html.Styled.Events exposing (onClick)
import Route


type alias Model =
    Int


type Msg
    = Inc


init : Session -> ( Model, Cmd Msg )
init session =
    ( 0, Cmd.none )


update : Session -> Msg -> Model -> ( Model, Cmd Msg )
update _ msg model =
    case msg of
        Inc ->
            ( model + 1
            , Cmd.none
            )


view : Session -> Model -> ( String, List (Html Msg) )
view _ model =
    ( "Second Page"
    , [ text "zddzddz" ]
    )
