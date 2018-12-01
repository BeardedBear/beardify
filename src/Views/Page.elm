module Views.Page exposing (frame)

import Browser exposing (Document)
import Html.Styled exposing (..)
import Html.Styled.Attributes exposing (class, css, href, src)
import Route
import Views.Meta
import Views.Player
import Views.Search
import Views.Sidebar
import Views.Theme


frame : Views.Meta.Config -> ( String, List (Html msg) ) -> Document msg
frame config ( title, content ) =
    { title = title ++ " - Beardify"
    , body =
        [ div [ class "app" ]
            [ Views.Theme.defaultCss
            , Views.Sidebar.view config
            , div [ class "content" ]
                [ div [ class "topbar" ] [ Views.Search.view config.session.search ]
                , div [ class "drawer" ] content
                , Views.Player.view config.session.player
                ]
            ]
            |> toUnstyled
        ]
    }
