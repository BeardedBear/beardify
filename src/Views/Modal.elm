module Views.Modal exposing (view)

import Data.Playlist exposing (PlaylistSimplified)
import Data.Session exposing (Session)
import Html exposing (Html, button, div, i, span, text)
import Html.Attributes exposing (class, classList)
import Html.Events exposing (onClick)
import Utils


type alias Config msg =
    { isOpen : Bool
    , session : Session
    , close : msg
    , add : String -> msg
    }


collectionItem : Config msg -> Session -> PlaylistSimplified -> Html msg
collectionItem config session playlist =
    span
        [ classList
            [ ( "playlist", True )
            , ( "active", Utils.getId session.url == playlist.id )
            ]
        , onClick <| config.add playlist.id
        ]
        [ i [ class "icon-book" ] [], text <| String.replace "#Collection " "" playlist.name ]


view : Config msg -> Html msg
view ({ session } as config) =
    if config.isOpen then
        div [ class "Modal" ]
            [ div [ class "Modal__overlay" ] []
            , div [ class "ModalContent" ]
                [ div [ class "Modal__head" ]
                    [ text "Add in a collection"
                    ]
                , div [ class "Modal__body" ]
                    [ if List.length session.playlists /= 0 then
                        div [ class "collections" ]
                            [ session.playlists
                                |> List.filter (\playlist -> String.contains "#Collection" playlist.name)
                                |> List.map (collectionItem config session)
                                |> div [ class "playlists-list" ]
                            ]

                      else
                        text ""
                    ]
                , div [ class "Modal__foot" ]
                    [ button [ class "button", onClick config.close ] [ text "Cancel" ]
                    ]
                ]
            ]

    else
        text ""
