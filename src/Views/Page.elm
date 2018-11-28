module Views.Page exposing (frame)

import Browser exposing (Document)
import Css exposing (..)
import Html.Styled exposing (..)
import Html.Styled.Attributes exposing (class, css, href, src)
import Meta
import Route
import Views.Meta
import Views.Player
import Views.Search
import Views.Sidebar as Sidebar exposing (..)
import Views.Theme exposing (Element, defaultCss)


frame : Views.Meta.Config -> ( String, List (Html msg) ) -> Document msg
frame config ( title, content ) =
    { title = title ++ " - Beardify"
    , body =
        [ div [ class "app" ]
            [ defaultCss
            , Sidebar.view config
            , div [ class "content" ]
                [ div [ class "topbar" ] [ Views.Search.view config.session.search ]
                , div [ class "drawer" ] content
                , Views.Player.view config.session.player
                ]
            ]
            |> toUnstyled
        ]
    }
