import React from 'react';
import {EdstButton} from "./resources/EdstButton";
import {useRootDispatch, useRootSelector} from "../redux/hooks";
import {
  sectorPolygonSelector,
  sectorProfilesSelector, selectedSectorsSelector,
  setSelectedSectors,
  toggleSector
} from "../redux/slices/sectorSlice";
import {setShowSectorSelector} from "../redux/slices/appSlice";
import {refreshEntriesThunk} from "../redux/slices/entriesSlice";
import {EdstTooltip} from "./resources/EdstTooltip";
import styled from "styled-components";

const SectorSelectorDiv = styled.div`color: #ffffff`;
const SectorSelectorH1 = styled(SectorSelectorDiv)`
  text-align: center;
  font-size: 25px;
`;
const SectorSelectorForm = styled(SectorSelectorDiv)`margin: 55px 0;`;
const CheckBoxBlock = styled(SectorSelectorDiv)`
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  flex-wrap: wrap;
  max-height: 25vh;
`;
const SectorSelectorInput = styled.input`
  &:not(:checked),
  &:checked {
    display: none;
  }

  &:not(:checked) + label:before,
  &:checked + label:before {
    content: "";
    display: inline-block;
    width: 18px;
    height: 12px;
    border: 2px solid #5a5a5a;
    box-sizing: border-box;
    border-radius: 25%;
    transition-property: all;
    transition-duration: 0.01s;
    transition-timing-function: linear;
    transition-delay: 0.01s;
  }

  &:not(:checked) + label:after,
  &:checked + label:after {
    content: "";
    font-family: fontawesome, serif;
    font-size: 18px;
    display: flex;
    height: 100%;
    align-items: center;
    position: absolute;
    top: 0;
    left: 0;
    color: #00711b;
  }

  &:not(:checked) + label:after {
    opacity: 0;
    transition-property: all;
    transition-duration: 0.01s;
    transition-timing-function: linear;
    transition-delay: 0s;
  }

  &:checked + label:before {
    opacity: 0;
    transition-property: all;
    transition-duration: 0.01s;
    transition-timing-function: linear;
    transition-delay: 0s;
  }

  &:checked + label:after {
    opacity: 1;
    transition-property: all;
    transition-duration: 0.01s;
    transition-timing-function: linear;
    transition-delay: 0.01s;
  }
`;
const SectorSelectorLabel = styled.label`
  position: relative;
  display: flex;
  align-items: center;
  margin-top: 10px;
  cursor: default;

  ::before, ::after {
    display: flex;
    align-items: center;
    height: 18px;
    width: 23px;
    margin: 0 12px;
  }
`;
const SectorSelectorDropdown = styled.select`
  margin-left: 5px;
  font-size: 16px;
  border: 1px solid #ADADAD;
  background-color: #000000;
  color: #FFFFFF;
`;

export const SectorSelector: React.FC = () => {
  const dispatch = useRootDispatch();
  const sectors = useRootSelector(sectorPolygonSelector);
  const profiles = useRootSelector(sectorProfilesSelector);
  const selectedSectors = useRootSelector(selectedSectorsSelector);

  const onProfileChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    if (!event.target.value) {
      dispatch(setSelectedSectors([]))
    } else if (event.target.value === 'All') {
      dispatch(setSelectedSectors([Object.keys(sectors)[0]]));
    } else {
      let profile = profiles.find(profile => profile.id === event.target.value);
      if (profile) {
        dispatch(setSelectedSectors(profile.sectors));
      }
    }
  }

  return (
    <SectorSelectorDiv>
      <link
        rel="stylesheet"
        href={"https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css"}
      />
      <div>
        <hr style={{color: '#000000', padding: 20, border: 'none'}}/>
        <SectorSelectorH1>Pick your sectors</SectorSelectorH1>
        <SectorSelectorForm>
          <SectorSelectorDropdown onChange={onProfileChange}>
            <option style={{color: "#ADADAD"}} value="">Select a profile (optional)</option>
            <option value="All">All</option>
            {profiles.map(profile => <option value={profile.id}>{profile.id}</option>)}
          </SectorSelectorDropdown>
          <CheckBoxBlock>
            {Object.entries(sectors).map(([id, sector]) =>
              <EdstTooltip title={sector?.properties?.name} key={`sector-selector-${id}-container`}>
                {[<SectorSelectorInput key={`sector-selector-${id}-input`} type="checkbox"
                                       onChange={() => dispatch(toggleSector(id))} id={id} value={id} name={id}
                                       checked={selectedSectors.includes(id)}
                />,
                  <SectorSelectorLabel key={`sector-selector-${id}-label`} htmlFor={id}>{id}</SectorSelectorLabel>]}
              </EdstTooltip>)}
          </CheckBoxBlock>
        </SectorSelectorForm>
        <EdstButton content="Save" onMouseDown={() => {
          dispatch(refreshEntriesThunk());
          dispatch(setShowSectorSelector(false));
        }}/>
      </div>
    </SectorSelectorDiv>
  );
};