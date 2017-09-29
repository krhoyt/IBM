# Stock Trading Business Network

> This is a Composer business network defined to support the illustration of event notifications, against the backdrop of a stock trading environment.

This business network defines:

**Participant**
`Trader`

**Asset**
`Stock`

**Transaction**
`Trade`
`Basket`

**Event**
`TradeComplete`
`BasketComplete`

Stock assets can be owned by a Trader, but association with the Trader is not required for this illustration. Stock assets can be updated by their resource, or through the use of the Trade or Basket transactions. Trade is for a single Stock asset change, and Basket is for a group of Stock asset changes.

To test this Business Network Definition in the **Test** tab:

Create a `Stock` asset:

```
{
  "$class": "org.acme.market.Stock",
  "symbol": "IBM",
  "name": "International Business Machines",
  "low": 100,
  "high": 200,
  "open": 110,
  "last": 111,
  "change": 1
}
```

Submit a `Trade` transaction:

```
{
  "$class": "org.acme.market.Trade",
  "stock": "resource:org.acme.market.Stock#IBM",
  "price": 112
}
```

After submitting this transaction, you will see the transaction in the "All Transactions" summary, and that a `TradeComplete` event has been emitted. As a result of the transaction, the `IBM` Stock asset `last` value will have changed from `111` to `112` and the `change` value will reflect a value of `1`. Running on Hyperledger Fabric, these event details would have been emitted over WebSocket.

Congratulations!
