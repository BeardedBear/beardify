module Views.Topbar exposing (view)

import Data.Session exposing (Session)
import Html exposing (..)
import Html.Attributes exposing (..)
import Views.Search as Search exposing (..)


view : Session -> Html msg
view _ =
    div [ class "Topbar" ]
        [ img [ class "Topbar__logo", src "./img/logo.svg" ] []
        , div [ class "TopBarNavigation" ]
            [ button [ class "TopBarNavigation__item Button nude" ] [ i [ class "icon-previous" ] [] ]
            , button [ class "TopBarNavigation__item Button nude disabled" ] [ i [ class "icon-next" ] [] ]
            ]
        , Search.view
        ]
