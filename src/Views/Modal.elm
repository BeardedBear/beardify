module Views.Modal exposing (view)

import Data.Session
import Html.Styled as Html exposing (..)
import Html.Styled.Attributes exposing (..)
import Html.Styled.Events exposing (..)
import Utils
import Views.Collection
import Views.Sidebar


type Msg
    = NoOp


type alias Config msg =
    { isOpen : Bool
    , session : Data.Session.Session
    , close : msg
    , add : String -> msg
    }


view : Config msg -> Html msg
view ({ session } as config) =
    if config.isOpen then
        div []
            [ div [ class "overlay" ] []
            , div [ class "modal" ]
                [ div [ class "head" ]
                    [ div [ class "title" ] [ text "Add in a collection" ]
                    ]
                , div [ class "chest" ]
                    [ let
                        collectionItem p =
                            span
                                [ classList
                                    [ ( "playlist", True )
                                    , ( "active", Utils.getId session.url == p.id )
                                    ]
                                , onClick <| config.add p.id
                                ]
                                [ i [ class "icon-book" ] [], text <| String.replace "#Collection " "" p.name ]
                      in
                      if List.length session.playlists /= 0 then
                        div [ class "collections" ]
                            [ session.playlists
                                |> List.filter (\f -> String.contains "#Collection" f.name)
                                |> List.map collectionItem
                                |> div [ class "playlists-list" ]
                            ]

                      else
                        text ""
                    ]
                , div [ class "foot" ]
                    [ button [ class "button", onClick config.close ] [ text "Cancel" ]
                    ]
                ]
            ]

    else
        text ""
