<?php

/*
 * This file is part of Sulu.
 *
 * (c) Sulu GmbH
 *
 * This source file is subject to the MIT license that is bundled
 * with this source code in the file LICENSE.
 */

namespace Sulu\Component\Content\Document\Behavior;

/**
 * Adds the user who created and lastly changed the document.
 */
interface LocalizedBlameBehavior
{
    /**
     * @return int|null
     */
    public function getCreator();

    /**
     * @return int|null
     */
    public function getChanger();
}
