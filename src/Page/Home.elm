module Page.Home exposing (Model, Msg(..), init, update, view)

import Browser exposing (Document)
import Data.Session exposing (Session)
import Html exposing (..)
import Http
import Markdown
import Request.Github as Github
import Task


type alias Model =
    { readme : String
    }


type Msg
    = ReadmeReceived (Result Http.Error String)


init : Session -> ( Model, Session, Cmd Msg )
init session =
    ( { readme = "Retrieving README from github" }
    , session
    , Github.getReadme session ReadmeReceived
    )


errorToMarkdown : Http.Error -> String
errorToMarkdown error =
    """## Error

There was an error attempting to retrieve README information:

> *""" ++ Github.errorToString error ++ "*"


update : Session -> Msg -> Model -> ( Model, Session, Cmd Msg )
update session msg model =
    case msg of
        ReadmeReceived (Ok readme) ->
            ( { model | readme = readme }
            , session
            , Cmd.none
            )

        ReadmeReceived (Err error) ->
            ( { model | readme = errorToMarkdown error }
            , session
            , Cmd.none
            )


view : Session -> Model -> ( String, List (Html Msg) )
view _ model =
    ( "Home"
    , [ model.readme
            |> Markdown.toHtml []
      ]
    )
