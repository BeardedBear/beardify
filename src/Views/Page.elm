module Views.Page exposing (ActivePage(..), Config, frame)

import Browser exposing (Document)
import Data.Session exposing (Session)
import Html exposing (..)
import Html.Attributes exposing (class)



-- import Route


type ActivePage
    = Home
    | Other


type alias Config =
    { session : Session
    , activePage : ActivePage
    }


frame : Config -> ( String, List (Html msg) ) -> Document msg
frame _ ( title, content ) =
    { title = title ++ " | Beardify "
    , body = [ main_ [ class "App" ] content ]
    }



-- viewHeader : Config -> Html msg
-- viewHeader { activePage } =
--     let
--         linkIf page route caption =
--             if page == activePage then
--                 strong [] [ text caption ]
--             else
--                 a [ Route.href route ] [ text caption ]
--     in
--     header []
--         [ h1 [] [ text "elm-kitchen" ]
--         , nav [] [ linkIf Home Route.Home "Home" ]
--         ]
