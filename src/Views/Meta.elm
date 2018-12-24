module Views.Meta exposing (Config)

import Data.Session


type alias Config =
    { session : Data.Session.Session
    }
