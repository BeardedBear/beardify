module Page.Home exposing (Msg(..), init, update, view)

import Data.Home
import Data.Session
import Html.Styled as Html exposing (..)
import Http


type Msg
    = ReadmeReceived (Result Http.Error String)


init : Data.Session.Session -> ( Data.Home.Model, Cmd Msg )
init session =
    ( { readme = "Retrieving README from github" }
    , Cmd.none
    )


update : Data.Session.Session -> Msg -> Data.Home.Model -> ( Data.Home.Model, Cmd Msg )
update _ msg model =
    case msg of
        ReadmeReceived (Ok readme) ->
            ( model
            , Cmd.none
            )

        ReadmeReceived (Err error) ->
            ( model
            , Cmd.none
            )


view : Data.Session.Session -> Data.Home.Model -> ( String, List (Html Msg) )
view session model =
    ( "Home"
    , [ div [] [ text <| Debug.toString session.search ]
      ]
    )
