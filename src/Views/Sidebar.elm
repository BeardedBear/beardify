module Views.Sidebar exposing (view)

import Html exposing (..)
import Html.Attributes exposing (..)


view : Html msg
view =
    div [ class "Sidebar" ]
        [ div [ class "Sidebar__collections" ]
            [ text "collections" ]
        , div [ class "Sidebar__playlists" ]
            [ text "playlists" ]
        ]
