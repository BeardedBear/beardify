module Views.Page exposing (frame)

import Browser exposing (Document)
import Css exposing (..)
import Html.Styled exposing (..)
import Html.Styled.Attributes exposing (class, css, href, src)
import Route
import Views.Root as Root exposing (..)
import Views.Sidebar as Sidebar exposing (..)
import Views.Theme exposing (Element, defaultCss)


frame : Root.Config -> ( String, List (Html msg) ) -> Document msg
frame config ( title, content ) =
    { title = title ++ " | elm-kitchen"
    , body =
        [ div [ class "app" ]
            [ defaultCss
            , Sidebar.view config
            , div [ class "content" ] content
            ]
            |> toUnstyled
        ]
    }