module Views.Collection exposing (view)

import Browser exposing (Document)
import Data.Playlist exposing (..)
import Data.Session exposing (Session)
import Html exposing (..)
import Html.Attributes exposing (class, classList, href, src)
import Html.Events exposing (..)
import Route
import Utils


type alias ViewCollectionsConfig =
    { session : Data.Session.Session
    , playlists : List PlaylistSimplified
    , hasTitle : Bool
    }


view : ViewCollectionsConfig -> Html msg
view ({ session, playlists, hasTitle } as viewCollectionsConfig) =
    let
        collectionItem p =
            a
                [ classList
                    [ ( "playlist", True )
                    , ( "active", Utils.getId session.url == p.id )
                    ]
                , Route.href <| Route.Collection p.id
                ]
                [ i [ class "icon-book" ] [], text <| String.replace "#Collection " "" p.name ]
    in
    if List.length playlists /= 0 then
        div [ class "collections" ]
            [ if hasTitle then
                div [ class "title" ] [ text "Collections" ]

              else
                text ""
            , playlists
                |> List.filter (\f -> String.contains "#Collection" f.name)
                |> List.map collectionItem
                |> div [ class "playlists-list" ]
            ]

    else
        text ""
