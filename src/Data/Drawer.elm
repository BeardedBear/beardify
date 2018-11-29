module Data.Drawer exposing
    ( AlbumModel
    , ArtistModel
    , DrawerType(..)
    , Model
    , PlaylistModel
    , init
    )

import Data.Album
import Data.Artist
import Data.Playlist
import Data.Track
import Data.Youtube
import Json.Decode


init : Model
init =
    { drawerType = Home
    , drawerArtist =
        { artist = Data.Artist.init
        , albums = []
        , videos = []
        , topTracks = []
        , relatedArtists = []
        }
    , drawerAlbum =
        { album = Data.Album.init
        , tracks = []
        }
    , drawerPlaylist =
        { playlist = Data.Playlist.init
        , tracks =
            { items = []
            , next = ""
            }
        }
    , drawerCollection =
        { playlist = Data.Playlist.init
        , tracks =
            { items = []
            , next = ""
            }
        }
    }


type alias ArtistModel =
    { artist : Data.Artist.Artist
    , albums : List Data.Album.Album
    , videos : List Data.Youtube.Video
    , topTracks : List Data.Track.Track
    , relatedArtists : List Data.Artist.Artist
    }


type alias AlbumModel =
    { album : Data.Album.Album
    , tracks : List Data.Track.TrackSimplified
    }


type alias PlaylistModel =
    { playlist : Data.Playlist.Playlist
    , tracks : Data.Playlist.PlaylistPaging
    }


type DrawerType
    = DrawArtist
    | DrawAlbum
    | DrawPlaylist
    | DrawCollection
    | Home
    | Releases
    | Listen


type alias Model =
    { drawerType : DrawerType
    , drawerArtist : ArtistModel
    , drawerAlbum : AlbumModel
    , drawerPlaylist : PlaylistModel
    , drawerCollection : PlaylistModel
    }
