module View.Home exposing (view)

import Html exposing (..)
import Html.Attributes exposing (..)
import Html.Events exposing (..)
import Root exposing (..)


view : Model -> Html Msg
view model =
    div [] [ text "Welcome !" ]
