module Route exposing (Route(..), fromUrl, href, pushUrl)

import Browser exposing (Document)
import Browser.Navigation as Nav
import Html.Styled exposing (Attribute)
import Html.Styled.Attributes as Attr
import Url exposing (Url)
import Url.Parser as Parser exposing ((</>), Parser)


type Route
    = Home
    | Counter
    | Collection String
    | Album String
    | Artist String


parser : Parser (Route -> a) a
parser =
    Parser.oneOf
        [ Parser.map Home Parser.top
        , Parser.map Counter (Parser.s "second-page")
        , Parser.map Collection (Parser.s "collection" </> Parser.string)
        , Parser.map Album (Parser.s "album" </> Parser.string)
        , Parser.map Artist (Parser.s "artist" </> Parser.string)
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

                Counter ->
                    [ "second-page" ]

                Collection id ->
                    [ "collection", id ]

                Album id ->
                    [ "album", id ]

                Artist id ->
                    [ "artist", id ]
    in
    "#/" ++ String.join "/" pieces