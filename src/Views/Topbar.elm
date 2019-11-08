module Views.Topbar exposing (view)

import Html exposing (..)
import Html.Attributes exposing (..)
import Views.Search as Search exposing (..)


view : Html msg
view =
    div [ class "Topbar" ]
        [ div [ class "TopbarLogo" ]
            [ img [ class "TopbarLogo__img", src "./img/logo.png" ] []
            , span [ class "TopbarLogo__name" ] [ text "Beardify" ]
            ]
        , Search.view
        , div [ class "User" ] [ text "Qui que je suis ?" ]
        ]
