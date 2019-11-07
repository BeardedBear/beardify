module Views.Page exposing (ActivePage(..), Config, frame)

import Browser exposing (Document)
import Data.Session exposing (Session)
import Html exposing (..)
import Html.Attributes exposing (class)
import Views.Player as Player exposing (..)
import Views.Sidebar as Sidebar exposing (..)
import Views.Topbar as Topbar exposing (..)



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
    , body =
        [ main_ [ class "App" ] content ]
    }
