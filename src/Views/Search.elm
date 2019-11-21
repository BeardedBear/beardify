module Views.Search exposing (view)

import Html exposing (..)
import Html.Attributes exposing (..)


view : Html msg
view =
    div [ class "Search" ]
        [ input [ class "Search__input", type_ "text", placeholder "Search..." ] []
        , div [ class "SearchResult" ]
            [ div [ class "SearchResult__section" ]
                [ h3 [ class "SearchResult__title" ] [ text "Artists" ]
                , ul [ class "SearchResultArtist List unstyled" ]
                    [ li []
                        [ a [ class "SearchResultArtist__item", href "" ]
                            [ img
                                [ class "SearchResult__img artist"
                                , src "https://i.scdn.co/image/c1fb4d88de092b5617e649bd4c406b5cab7d3ddd"
                                ]
                                []
                            , span [ class "SearchResult__label" ] [ text "Metallica" ]
                            ]
                        ]
                    , li []
                        [ a [ class "SearchResultArtist__item", href "" ]
                            [ img
                                [ class "SearchResult__img artist"
                                , src "https://i.scdn.co/image/4fd99c3f72971a5b67b653155fe00caf9289ba8c"
                                ]
                                []
                            , span [ class "SearchResult__label" ] [ text "Eagles Of Death Metal" ]
                            ]
                        ]
                    , li []
                        [ a [ class "SearchResultArtist__item", href "" ]
                            [ img
                                [ class "SearchResult__img artist"
                                , src "https://i.scdn.co/image/ab67616d0000485119fb43a41125d19db1066e4c"
                                ]
                                []
                            , span [ class "SearchResult__label" ] [ text "Metalocalypse: Dethklok" ]
                            ]
                        ]
                    , li []
                        [ a [ class "SearchResultArtist__item", href "" ]
                            [ img
                                [ class "SearchResult__img artist"
                                , src "https://i.scdn.co/image/c1fb4d88de092b5617e649bd4c406b5cab7d3ddd"
                                ]
                                []
                            , span [ class "SearchResult__label" ] [ text "Metallica" ]
                            ]
                        ]
                    ]
                ]
            , div [ class "SearchResult__section" ]
                [ h3 [ class "SearchResult__title" ] [ text "Albums" ]
                , ul [ class "SearchResultArtist List unstyled" ]
                    [ li []
                        [ a [ class "SearchResultArtist__item", href "" ]
                            [ img
                                [ class "SearchResult__img"
                                , src "https://i.scdn.co/image/08de8ef442ead93a54ce23bc3a717edfbb3a6fd8"
                                ]
                                []
                            , div []
                                [ div [ class "SearchResult__label" ] [ text "Metallica (1991)" ]
                                , div [ class "SearchResult__subLabel" ]
                                    [ a [ href "", class "Artist__link" ] [ text "Metallica" ]
                                    ]
                                ]
                            ]
                        ]
                    , li []
                        [ a [ class "SearchResultArtist__item", href "" ]
                            [ img
                                [ class "SearchResult__img"
                                , src "https://i.scdn.co/image/4841b1ab42b7c3e0272c3b7df570bc96857e93e4"
                                ]
                                []
                            , div []
                                [ div [ class "SearchResult__label" ] [ text "Metal Galaxy (2019)" ]
                                , div [ class "SearchResult__subLabel" ]
                                    [ a [ href "", class "Artist__link" ] [ text "BABYMETAL" ]
                                    ]
                                ]
                            ]
                        ]
                    , li []
                        [ a [ class "SearchResultArtist__item", href "" ]
                            [ img
                                [ class "SearchResult__img"
                                , src "https://i.scdn.co/image/c1e6f8f6c02db088661f585c3cb67cddfb511c88"
                                ]
                                []
                            , div []
                                [ div [ class "SearchResult__label" ] [ text "Master Of Puppets (Remastered) (1986)" ]
                                , div [ class "SearchResult__subLabel" ]
                                    [ a [ href "", class "Artist__link" ] [ text "Metallica" ]
                                    ]
                                ]
                            ]
                        ]
                    , li []
                        [ a [ class "SearchResultArtist__item", href "" ]
                            [ img
                                [ class "SearchResult__img"
                                , src "https://i.scdn.co/image/69b5b8dcb648dc590e4fd21b7e6ef402ebb730e5"
                                ]
                                []
                            , div []
                                [ div [ class "SearchResult__label" ] [ text "...And Justice For All (1988)" ]
                                , div [ class "SearchResult__subLabel" ]
                                    [ a [ href "", class "Artist__link" ] [ text "Metallica" ]
                                    ]
                                ]
                            ]
                        ]
                    ]
                ]
            , div [ class "SearchResult__section" ]
                [ h3 [ class "SearchResult__title" ] [ text "Tracks" ]
                , ul [ class "SearchResultArtist List unstyled" ]
                    [ li []
                        [ a [ class "SearchResultArtist__item track", href "" ]
                            [ img
                                [ class "SearchResult__img track"
                                , src "https://i.scdn.co/image/08de8ef442ead93a54ce23bc3a717edfbb3a6fd8"
                                ]
                                []
                            , div []
                                [ div [ class "SearchResult__label" ] [ text "Metallica (1991)" ]
                                , div [ class "SearchResult__subLabel" ]
                                    [ a [ href "", class "Artist__link" ] [ text "Metallica" ]
                                    ]
                                ]
                            ]
                        ]
                    , li []
                        [ a [ class "SearchResultArtist__item track", href "" ]
                            [ img
                                [ class "SearchResult__img track"
                                , src "https://i.scdn.co/image/4841b1ab42b7c3e0272c3b7df570bc96857e93e4"
                                ]
                                []
                            , div []
                                [ div [ class "SearchResult__label" ] [ text "Metal Galaxy (2019)" ]
                                , div [ class "SearchResult__subLabel" ]
                                    [ a [ href "", class "Artist__link" ] [ text "BABYMETAL" ]
                                    ]
                                ]
                            ]
                        ]
                    , li []
                        [ a [ class "SearchResultArtist__item track", href "" ]
                            [ img
                                [ class "SearchResult__img track"
                                , src "https://i.scdn.co/image/c1e6f8f6c02db088661f585c3cb67cddfb511c88"
                                ]
                                []
                            , div []
                                [ div [ class "SearchResult__label" ] [ text "Master Of Puppets (Remastered) (1986)" ]
                                , div [ class "SearchResult__subLabel" ]
                                    [ a [ href "", class "Artist__link" ] [ text "Metallica" ]
                                    ]
                                ]
                            ]
                        ]
                    , li []
                        [ a [ class "SearchResultArtist__item track", href "" ]
                            [ img
                                [ class "SearchResult__img track"
                                , src "https://i.scdn.co/image/69b5b8dcb648dc590e4fd21b7e6ef402ebb730e5"
                                ]
                                []
                            , div []
                                [ div [ class "SearchResult__label" ] [ text "...And Justice For All (1988)" ]
                                , div [ class "SearchResult__subLabel" ]
                                    [ a [ href "", class "Artist__link" ] [ text "Metallica" ]
                                    ]
                                ]
                            ]
                        ]
                    ]
                ]
            ]
        ]
