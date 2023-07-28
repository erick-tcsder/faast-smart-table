import classNames from "classnames";
import { useRef, useState } from "react";
import { Overlay } from "react-bootstrap";
import { useOutsideAlerter } from "../../../hooks/useOutsideAlerter";

export const PingItem = (itemProps:{
    pinged?: 'left'|'right'|false;
    handleChangePinged?: (dir: 'left'|'right'|false)=>void
  })=>{
      const [show, setShow] = useState(false);
      const target = useRef(null);
      const sref = useRef<HTMLDivElement | null>(null)
      useOutsideAlerter(sref,()=>{
        setShow(false)
      })
      return (
          <>
              <li ref={target} onClick={() => setShow(!show)} className="dropdown-item">Anclar</li>
              <Overlay target={target.current} show={show} placement="right">
              {({
                  placement: _placement,
                  arrowProps: _arrowProps,
                  show: _show,
                  popper: _popper,
                  hasDoneInitialMeasure: _hasDoneInitialMeasure,
                  ...props
              }) =>{
                return (
                  <div
                  {...props}
                  style={{
                      position: "absolute",
                      backgroundColor: "white",
                      border:'1px solid #ccc',
                      borderRadius: 3,
                      ...props.style,
                  }}
                  >
                    <div className="d-flex flex-column" ref={sref} style={{padding: '5px 0px'}}>
                      <div onClick={()=>{itemProps?.handleChangePinged?.(false); setShow(false)}} className={classNames("px-3 py-1 menu-item-hover-secondary",!itemProps.pinged && 'active')}>(ninguno)</div>
                      <div onClick={()=>{itemProps?.handleChangePinged?.("left"); setShow(false)}} className={classNames("px-3 py-1 menu-item-hover-secondary",(itemProps.pinged === 'left') && 'active')}>Izquierda</div>
                      <div onClick={()=>{itemProps?.handleChangePinged?.("right"); setShow(false)}} className={classNames("px-3 py-1 menu-item-hover-secondary",(itemProps.pinged === 'right') && 'active')}>Derecha</div>
                    </div>
                  </div>
              )}}
              </Overlay>
          </>
      )
  }