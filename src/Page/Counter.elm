module Page.Counter exposing (Msg, init, update, view)

import Data.Counter
import Data.Session exposing (Session)
import Html as Html exposing (..)
import Html.Attributes exposing (..)
import Html.Events exposing (onClick)


type Msg
    = Inc


init : Session -> ( Data.Counter.Model, Cmd Msg )
init session =
    ( 0, Cmd.none )


update : Session -> Msg -> Data.Counter.Model -> ( Data.Counter.Model, Cmd Msg )
update _ msg model =
    case msg of
        Inc ->
            ( model + 1
            , Cmd.none
            )


view : Session -> Data.Counter.Model -> ( String, List (Html Msg) )
view _ model =
    ( "Second Page"
    , [ text "zddzddz" ]
    )
