module Views.Topbar exposing (view)

import Html exposing (..)
import Html.Attributes exposing (..)
import Views.Search as Search exposing (..)


view : Html msg
view =
    div [ class "Topbar" ]
        [ div [ class "Sidebar__logo" ] [ text "LOGO" ]
        , Search.view
        , div [ class "User" ] [ text "Qui que je suis ?" ]
        ]
