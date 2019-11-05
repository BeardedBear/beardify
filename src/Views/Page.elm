module Views.Page exposing (ActivePage(..), Config, frame)

import Browser exposing (Document)
import Data.Session exposing (Session)
import Html exposing (..)
import Html.Attributes exposing (class, href, src)
import Route


type ActivePage
    = Home
    | Other


type alias Config =
    { session : Session
    , activePage : ActivePage
    }


frame : Config -> ( String, List (Html msg) ) -> Document msg
frame config ( title, content ) =
    { title = title ++ " | Beardify "
    , body =
        [ viewHeader config
        , main_ [] content
        ]
    }


viewHeader : Config -> Html msg
viewHeader { activePage } =
    let
        linkIf page route caption =
            if page == activePage then
                strong [] [ text caption ]

            else
                a [ Route.href route ] [ text caption ]
    in
    header []
        [ h1 [] [ text "elm-kitchen" ]
        , nav []
            [ linkIf Home Route.Home "Home"
            , text " | "
            ]
        , a
            [ class "GithubIcon"
            , Html.Attributes.target "_blank"
            , href "https://github.com/allo-media/elm-kitchen"
            ]
            [ img
                [ src "https://upload.wikimedia.org/wikipedia/commons/thumb/e/eb/Ei-sc-github.svg/768px-Ei-sc-github.svg.png"
                ]
                []
            , span [] [ text "Github" ]
            ]
        ]
