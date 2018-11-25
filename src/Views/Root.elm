module Views.Root exposing (ActivePage(..), Config)

import Data.Session exposing (Session)


type ActivePage
    = Home
    | Counter
    | Collection
    | Album
    | Other


type alias Config =
    { session : Session
    , activePage : ActivePage
    }
