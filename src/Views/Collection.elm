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
    }


view : ViewCollectionsConfig -> Html msg
view { session, playlists } =
    let
        collectionItem playlist =
            a
                [ classList
                    [ ( "playlist", True )
                    , ( "active", Utils.getId session.url == playlist.id )
                    ]
                , Route.href <| Route.Collection playlist.id
                ]
                [ i [ class "icon-book" ] [], text <| String.replace "#Collection " "" playlist.name ]
    in
    if List.length playlists /= 0 then
        div [ class "collections" ]
            [ div [ class "title" ] [ text "Collections" ]
            , playlists
                |> List.filter (\f -> String.contains "#Collection" f.name)
                |> List.map collectionItem
                |> div [ class "playlists-list" ]
            ]

    else
        text ""
