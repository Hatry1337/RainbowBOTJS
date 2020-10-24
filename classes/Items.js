class Item {
    id = 0;
    name = "Empty Item";
    meta = {
        basemeta: "Base Meta"
    };
    desciption = "Base unused item.";
    baseprice = 0;
}

class VideoCard extends Item{
    id = 1000;
    name = "Base VideoCard";
    description = "Base ununsed VideoCard";
    miningSpeed = 0;
    maxDurability = 100;
    curDurability = 100;
    power = 0;
}

class GTX1050Ti extends VideoCard{
    id = 1001;
    name = "nVidia GeForce GTX 1050Ti";
    description = "Low-Level Graphics Adapter.";
    miningSpeed = 0.1;
    power = 75;
    baseprice = 150;
}