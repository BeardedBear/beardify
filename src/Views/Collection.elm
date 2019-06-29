module Views.Collection exposing (view)

import Data.Playlist exposing (PlaylistSimplified)
import Data.Session exposing (Session)
import Html exposing (Html, a, div, i, text)
import Html.Attributes exposing (class, classList, href)
import Route
import Utils


type alias ViewCollectionsConfig =
    { session : Session
    , playlists : List PlaylistSimplified
    , hasTitle : Bool
    }


view : ViewCollectionsConfig -> Html msg
view { session, playlists, hasTitle } =
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
