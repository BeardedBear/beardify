module Views.Search exposing (view)

import Html exposing (..)
import Html.Attributes exposing (..)


view : Html msg
view =
    div [ class "Search" ]
        [ input [ class "Search__input", type_ "text" ] []
        ]
