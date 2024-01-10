import { Access, AccessTarget, EphemeralConfigEntry, Module, Synergy } from "synergy3";
import { StorageWrapper } from "./Storage/StorageWrapper";
import { ItemsCTL } from "./Controls/ItemsCTL";
import { ShopCTL } from "./Controls/ShopCTL";
import EconomyCTL from "./Controls/EconomyCTL";
import Control from "./Controls/Control";
import { MiningCTL } from "./Controls/MiningCTL";
import TopCTL from "./Controls/TopCTL";
import Prometheus from "../../Prometheus";
import { StorageUserEconomyInfo } from "synergy3/dist/Models/StorageUserEconomyInfo";
import { ItemsRegistry } from "./Game/Items/ItemsRegistry";
import ItemMiner from "./Game/Items/ItemMiner";
import sequelize from "sequelize";

export type NumberFormatter = (n: number) => string;

export const ECONOMY_CONSTANTS = {
    wattHourCost: 0.00727
}

export default class Economy extends Module{
    public Name:        string = "[Alpha] Economy";
    public Description: string = "The Economy Module.";
    public Category:    string = "Economy";
    public Author:      string = "Thomasss#9258";

    public Access: AccessTarget[] = [ Access.PLAYER() ]

    private storage: StorageWrapper;
    private controls: Control[];

    public configShortNumbers: EphemeralConfigEntry<"bool">;

    constructor(bot: Synergy, UUID: string) {
        super(bot, UUID);

        this.configShortNumbers = this.bot.config.defaultConfigEntry("user", this.Name, new EphemeralConfigEntry(
            "economy_short_numbers",
            "Use short numbers in economy module (like 1.2k, 6.5M, etc.)",
            "bool",
            false
        ));

        this.storage = new StorageWrapper(this.bot, this.UUID);

        this.controls = [
            new ItemsCTL(this.bot, this, this.storage),
            new ShopCTL(this.bot, this, this.storage),
            new EconomyCTL(this.bot, this, this.storage),
            new MiningCTL(this.bot, this, this.storage),
            new TopCTL(this.bot, this, this.storage)
        ]
    }

    public numFormatterFactory(unifiedId: string): NumberFormatter;
    public numFormatterFactory(value: boolean): NumberFormatter;
    public numFormatterFactory(unifiedIdOrValue: string | boolean): NumberFormatter {
        return (num: number) => {
            let flag: boolean;
            if(typeof unifiedIdOrValue === "boolean") {
                flag = unifiedIdOrValue;
            } else {
                flag = this.configShortNumbers.getValue(unifiedIdOrValue) ?? false;
            }

            if(flag) {
                return Intl.NumberFormat('en-US', {
                    notation: "compact",
                    maximumFractionDigits: 3
                }).format(num);
            }
            return parseFloat(num.toFixed(5)).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
        }
    }

    public async Init(){
        await this.storage.createRootObject();

        for(let c of this.controls){
            if(c.Init){
                await c.Init();
            }
        }

        let m_economy_items = Prometheus.createGauge("economy_items", "Total count of economy items");
        Prometheus.createGauge("economy_players", "Total count of economy players", async (g) => {
            let players = await this.storage.getPlayersData();
            
            g.set(players.length);
            m_economy_items.set(players.reduce((pAcc, pCurr) => pAcc + pCurr.inventory.reduce((iAcc, iCurr) => iAcc + iCurr.size, 0), 0));
        });
        
        Prometheus.createGauge("economy_points_total", "Count of total economy points", async (g) => {
            let result = await StorageUserEconomyInfo.findAll({
                attributes: [
                    [sequelize.fn('sum', sequelize.col('economyPoints')), 'totalPoints'],
                ],
                raw: true
            }) as unknown as { totalPoints: number | string }[];
            
            g.set(parseInt(`${result[0].totalPoints}`));
        }); 
        
        let m_economy_total_power_consumption = Prometheus.createGauge("economy_total_power_consumption", "Total economy power consumption");
        Prometheus.createGauge("economy_total_mining_rate", "Total economy mining rate", async (g) => {
            g.reset();
            m_economy_total_power_consumption.reset();
            let players = await this.storage.getPlayersData();
            for(let p of players) {
                let items = p.inventory.map(i => ({ item: ItemsRegistry.getItem(i.itemId), count: i.size }));
                for(let i of items) {
                    if(i.item instanceof ItemMiner) {
                        g.inc(i.item.miningRate * i.count);
                        m_economy_total_power_consumption.inc(i.item.powerConsumption * i.count);
                    }
                }
            }
        });
    }

    public async UnLoad(){
        for(let c of this.controls){
            if(c.Unload){
                await c.Unload();
            }
        }
    }
}