module Views.Topbar exposing (view)

import Data.Session exposing (Session)
import Html exposing (..)
import Html.Attributes exposing (..)
import Views.Search as Search exposing (..)


view : Session -> Html msg
view session =
    div [ class "Topbar" ]
        [ div [ class "TopbarLogo" ]
            [ img [ class "TopbarLogo__img", src "./img/logo.png" ] []
            , span [ class "TopbarLogo__name" ] [ text "Beardify" ]
            ]
        , div [ class "TopBarNavigation" ]
            [ button [ class "TopBarNavigation__item Button nude" ] [ i [ class "icon-previous" ] [] ]
            , button [ class "TopBarNavigation__item Button nude disabled" ] [ i [ class "icon-next" ] [] ]
            ]
        , Search.view
        , div [ class "TopbarUser" ]
            [ case session.store.auth of
                Just _ ->
                    text "Connecté !"

                Nothing ->
                    text "Oups..."
            ]
        ]
