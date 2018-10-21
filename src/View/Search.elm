module View.Search exposing (view)

import Html exposing (..)
import Html.Attributes exposing (..)
import Html.Events exposing (..)
import Image exposing (..)
import Root exposing (..)
import Search exposing (..)
import Utils


view : Search.Model -> Html Msg
view searchMsg =
    let
        artistItem a =
            div [ class "artist-item", onClick (Get a.id) ]
                [ div [ class "img" ] [ imageView Small a.images ]
                , span [] [ text a.name ]
                ]

        albumItem a =
            div [ style "clear" "both", style "margin-bottom" "10px" ]
                [ div [ class "search-cover-image", onClick (ChangePlaying a.uri) ] [ imageView Small a.images ]
                , strong [ onClick (GetA a.id) ] [ text <| a.name ++ " " ]
                , text <| "(" ++ Utils.releaseDateFormat a.release_date ++ ")"
                , br [] []
                , Html.small [] (List.map (\artists -> text artists.name) a.artists)
                ]

        trackItem t =
            div []
                [ div [ onClick (ChangePlayingTrack [ t.uri ]), class "track-icon" ] [ text "🎵 " ]
                , strong [] [ text t.name ]
                , br [] []
                , Html.small [] (List.map (\artists -> text <| artists.name) t.artists)
                , span [] [ text " - " ]
                , Html.small [] [ text t.album.name ]
                , span [ style "float" "right" ]
                    [ text (Utils.durationFormat t.duration_ms)
                    ]
                ]
    in
    div [ class "search" ]
        [ div [] [ input [ placeholder "Recherche", type_ "text", onInput Query, Html.Attributes.value searchMsg.searchQuery ] [] ]
        , if searchMsg.searchQuery /= "" then
            div [ class "results" ]
                [ div []
                    [ div [ class "title" ] [ text "Artists" ]
                    , div [] (searchMsg.findArtist |> List.map artistItem)
                    ]
                , div []
                    [ div [ class "title" ] [ text "Albums" ]
                    , div []
                        (searchMsg.findAlbum
                            |> List.filter (\a -> a.album_type == "album")
                            |> List.map albumItem
                        )
                    ]
                , div []
                    [ div [ class "title" ] [ text "Tracks" ]
                    , div []
                        (searchMsg.findTrack |> List.map trackItem)
                    ]
                ]

          else
            text ""
        ]
