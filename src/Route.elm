module Route exposing (Route(..), fromUrl, href, pushUrl)

import Browser.Navigation as Nav
import Html exposing (Attribute)
import Html.Attributes as Attr
import Url exposing (Url)
import Url.Parser as Parser exposing (Parser)


type Route
    = Home
    | Login


parser : Parser (Route -> a) a
parser =
    Parser.oneOf
        [ Parser.map Home Parser.top
        , Parser.map Login (Parser.s "login")
        ]


fromUrl : Url -> Maybe Route
fromUrl url =
    { url | path = Maybe.withDefault "" url.fragment, fragment = Nothing }
        |> Parser.parse parser


href : Route -> Attribute msg
href route =
    Attr.href (toString route)


pushUrl : Nav.Key -> Route -> Cmd msg
pushUrl key route =
    Nav.pushUrl key (toString route)


toString : Route -> String
toString route =
    let
        pieces =
            case route of
                Home ->
                    []

                Login ->
                    [ "login" ]
    in
    "#/" ++ String.join "/" pieces
