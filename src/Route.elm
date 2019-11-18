module Route exposing (Route(..), fromUrl, href, pushUrl)

import Browser.Navigation as Nav
import Data.Artist as Artist
import Html exposing (Attribute)
import Html.Attributes as Attr
import Url exposing (Url)
import Url.Parser as Parser exposing ((</>), Parser, oneOf, s, top)


type Route
    = Home
    | Artist Artist.Id
    | Login


parser : Parser (Route -> a) a
parser =
    oneOf
        [ Parser.map Home top
        , Parser.map Login (s "login")
        , Parser.map Artist (s "artists" </> Artist.parseId)
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
                Artist id ->
                    [ "artists", Artist.idToString id ]

                Home ->
                    []

                Login ->
                    [ "login" ]
    in
    "#/" ++ String.join "/" pieces
