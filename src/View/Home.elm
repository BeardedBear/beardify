module View.Home exposing (view)

import Html exposing (..)
import Html.Attributes exposing (..)
import Html.Events exposing (..)
import List.Extra as LE
import Root exposing (..)
import Tuple


view : Model -> Html Msg
view model =
    div [] [ text "Welcome !" ]
