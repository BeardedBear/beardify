module Views.Theme exposing (Element, defaultCss, theme)

import Css exposing (..)
import Css.Global exposing (body, global, html)
import Html.Styled exposing (Attribute, Html)


type alias Theme =
    { primaryColor : Color
    , primaryBgColor : Color
    , secondaryBgColor : Color
    , fonts : List String
    }


type alias Element msg =
    List (Attribute msg) -> List (Html msg) -> Html msg


theme : Theme
theme =
    { primaryColor = hex "333"
    , primaryBgColor = hex "b01246"
    , secondaryBgColor = hex "fafafa"
    , fonts = [ "Lato", .value sansSerif ]
    }


defaultCss : Html msg
defaultCss =
    global
        [ html
            [ width (pct 100)
            , height (pct 100)
            ]
        , body
            [-- fontFamilies theme.fonts
            ]
        ]
